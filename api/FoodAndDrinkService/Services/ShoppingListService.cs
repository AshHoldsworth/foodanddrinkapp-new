using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using MongoDB.Bson;

namespace FoodAndDrinkService.Services;

public interface IShoppingListService
{
    Task<ShoppingList?> GetCurrentShoppingList(string groupId);
    Task<List<ShoppingList>> GetCompletedShoppingLists(string groupId, int limit);
    Task<ShoppingList> GenerateShoppingList(string userId, string groupId, int daysAhead);
    Task<ShoppingList> SetItemPurchased(string userId, string groupId, string shoppingListId, string ingredientId, bool isPurchased);
    Task<ShoppingList> CompleteShoppingList(string userId, string groupId, string shoppingListId);
}

public class ShoppingListService : IShoppingListService
{
    private readonly IShoppingListRepository _shoppingListRepository;
    private readonly IMealPlanRepository _mealPlanRepository;
    private readonly IMealRepository _mealRepository;
    private readonly IIngredientRepository _ingredientRepository;
    private readonly IInventoryRepository _inventoryRepository;

    public ShoppingListService(
        IShoppingListRepository shoppingListRepository,
        IMealPlanRepository mealPlanRepository,
        IMealRepository mealRepository,
        IIngredientRepository ingredientRepository,
        IInventoryRepository inventoryRepository)
    {
        _shoppingListRepository = shoppingListRepository;
        _mealPlanRepository = mealPlanRepository;
        _mealRepository = mealRepository;
        _ingredientRepository = ingredientRepository;
        _inventoryRepository = inventoryRepository;
    }

    public async Task<ShoppingList?> GetCurrentShoppingList(string groupId)
    {
        return await _shoppingListRepository.GetActive(groupId);
    }

    public async Task<List<ShoppingList>> GetCompletedShoppingLists(string groupId, int limit)
    {
        var normalizedLimit = Math.Clamp(limit, 1, 100);
        return await _shoppingListRepository.GetCompleted(groupId, normalizedLimit);
    }

    public async Task<ShoppingList> GenerateShoppingList(string userId, string groupId, int daysAhead)
    {
        if (daysAhead < 1 || daysAhead > 28)
            throw new ArgumentException("Days ahead must be between 1 and 28.");

        var existingActiveList = await _shoppingListRepository.GetActive(groupId);
        if (existingActiveList != null)
            throw new ArgumentException("A shopping list is already active.");

        var startDate = NormalizeDate(DateTime.UtcNow);
        var endDate = startDate.AddDays(daysAhead - 1);

        var ingredientRequirementByName = await BuildIngredientRequirements(groupId, startDate, endDate);
        var ingredients = await _ingredientRepository.GetAllIngredients(new IngredientFilterParams());
        var inventoryByIngredientId = await _inventoryRepository.GetStockByIngredientIds(
            groupId,
            ingredients.Select(item => item.Id).ToList());

        var ingredientsByName = ingredients
            .GroupBy(ingredient => ingredient.Name.Trim().ToLowerInvariant())
            .ToDictionary(group => group.Key, group => group.First());

        var items = new List<ShoppingListItem>();

        foreach (var requirement in ingredientRequirementByName.OrderBy(item => item.Key))
        {
            if (!ingredientsByName.TryGetValue(requirement.Key, out var ingredient))
                continue;

            var stockQuantity = inventoryByIngredientId.TryGetValue(ingredient.Id, out var quantity)
                ? quantity
                : 0;

            var quantityToPurchase = Math.Max(0, requirement.Value - stockQuantity);
            if (quantityToPurchase <= 0)
                continue;

            items.Add(new ShoppingListItem(
                ingredientId: ingredient.Id,
                ingredientName: ingredient.Name,
                quantity: quantityToPurchase));
        }

        var shoppingList = new ShoppingList(
            id: ObjectId.GenerateNewId().ToString(),
            groupId: groupId,
            startDate: startDate,
            endDate: endDate,
            items: items,
            createdAt: DateTime.UtcNow,
            lastModifiedBy: userId,
            lastModifiedAt: DateTime.UtcNow);

        await _shoppingListRepository.Insert(shoppingList);
        return shoppingList;
    }

    public async Task<ShoppingList> SetItemPurchased(
        string userId,
        string groupId,
        string shoppingListId,
        string ingredientId,
        bool isPurchased)
    {
        var shoppingList = await _shoppingListRepository.GetById(groupId, shoppingListId)
            ?? throw new ArgumentException("Shopping list not found.");

        if (shoppingList.IsCompleted)
            throw new ArgumentException("Completed shopping lists cannot be changed.");

        var item = shoppingList.Items.FirstOrDefault(i => i.IngredientId == ingredientId)
            ?? throw new ArgumentException("Shopping list item not found.");

        if (item.IsPurchased == isPurchased)
            return shoppingList;

        if (isPurchased)
        {
            await _inventoryRepository.IncrementStockQuantity(groupId, item.IngredientId, item.Quantity);
        }
        else
        {
            await _inventoryRepository.IncrementStockQuantity(groupId, item.IngredientId, -item.Quantity);
        }

        shoppingList.SetItemPurchased(item.IngredientId, isPurchased, userId);
        await _shoppingListRepository.Replace(shoppingList);

        return shoppingList;
    }

    public async Task<ShoppingList> CompleteShoppingList(string userId, string groupId, string shoppingListId)
    {
        var shoppingList = await _shoppingListRepository.GetById(groupId, shoppingListId)
            ?? throw new ArgumentException("Shopping list not found.");

        if (shoppingList.IsCompleted)
            return shoppingList;

        if (shoppingList.Items.Any(item => !item.IsPurchased))
            throw new ArgumentException("All items must be marked purchased before completing the list.");

        shoppingList.Complete(userId);
        await _shoppingListRepository.Replace(shoppingList);

        return shoppingList;
    }

    private async Task<Dictionary<string, int>> BuildIngredientRequirements(string groupId, DateTime startDate, DateTime endDate)
    {
        var weekStarts = Enumerable.Range(0, (endDate - startDate).Days + 1)
            .Select(offset => GetWeekStart(startDate.AddDays(offset)))
            .Distinct()
            .ToList();

        var allRelevantDays = new List<MealPlanDay>();

        foreach (var weekStart in weekStarts)
        {
            var plan = await _mealPlanRepository.GetByWeekStart(groupId, weekStart);
            if (plan == null)
                continue;

            allRelevantDays.AddRange(plan.Days.Where(day => day.Date >= startDate && day.Date <= endDate));
        }

        var mealIds = allRelevantDays
            .SelectMany(day => new[] { day.LunchMealId, day.DinnerMealId })
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id!)
            .Distinct()
            .ToList();

        if (mealIds.Count == 0)
            return new Dictionary<string, int>();

        var meals = await _mealRepository.GetMealsByIds(mealIds);

        return meals
            .SelectMany(meal => meal.Ingredients)
            .Where(ingredient => !string.IsNullOrWhiteSpace(ingredient.Name))
            .Select(ingredient => ingredient.Name.Trim().ToLowerInvariant())
            .GroupBy(name => name)
            .ToDictionary(group => group.Key, group => group.Count());
    }

    private static DateTime GetWeekStart(DateTime date)
    {
        var normalizedDate = NormalizeDate(date);
        var daysSinceMonday = ((int)normalizedDate.DayOfWeek + 6) % 7;
        return normalizedDate.AddDays(-daysSinceMonday);
    }

    private static DateTime NormalizeDate(DateTime date)
    {
        var utcDate = date.Kind switch
        {
            DateTimeKind.Utc => date,
            DateTimeKind.Local => date.ToUniversalTime(),
            _ => DateTime.SpecifyKind(date, DateTimeKind.Utc),
        };

        return DateTime.SpecifyKind(utcDate.Date, DateTimeKind.Utc);
    }
}
