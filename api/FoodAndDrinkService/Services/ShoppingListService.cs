using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using Microsoft.Extensions.Logging;

namespace FoodAndDrinkService.Services;

public interface IShoppingListService
{
    Task<ShoppingList?> GetCurrentShoppingList(string groupId);
    Task<List<ShoppingList>> GetCompletedShoppingLists(string groupId, int limit);
    Task<ShoppingList> GenerateShoppingList(string userId, string groupId, int daysAhead);
    Task<ShoppingList> CreateManualShoppingList(string userId, string groupId);
    Task<ShoppingList> AddItemToShoppingList(string userId, string groupId, string shoppingListId, string ingredientId, string ingredientName, int quantity, string uoM);
    Task<ShoppingList> UpdateShoppingListItemQuantity(string userId, string groupId, string shoppingListId, string ingredientId, int quantity);
    Task<ShoppingList> RemoveItemFromShoppingList(string userId, string groupId, string shoppingListId, string ingredientId);
    Task<ShoppingList> SetItemPurchased(string userId, string groupId, string shoppingListId, string ingredientId, bool isPurchased);
    Task<ShoppingList> CompleteShoppingList(string userId, string username, string groupId, string shoppingListId);
}

public class ShoppingListService : IShoppingListService
{
    private readonly IShoppingListRepository _shoppingListRepository;
    private readonly IMealPlanRepository _mealPlanRepository;
    private readonly IMealRepository _mealRepository;
    private readonly IIngredientRepository _ingredientRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IUserGroupRepository _userGroupRepository;
    private readonly ILogger<ShoppingListService> _logger;

    public ShoppingListService(
        IShoppingListRepository shoppingListRepository,
        IMealPlanRepository mealPlanRepository,
        IMealRepository mealRepository,
        IIngredientRepository ingredientRepository,
        IInventoryRepository inventoryRepository,
        IUserGroupRepository userGroupRepository,
        ILogger<ShoppingListService> logger)
    {
        _shoppingListRepository = shoppingListRepository;
        _mealPlanRepository = mealPlanRepository;
        _mealRepository = mealRepository;
        _ingredientRepository = ingredientRepository;
        _inventoryRepository = inventoryRepository;
        _userGroupRepository = userGroupRepository;
        _logger = logger;
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
        {
            _logger.LogWarning("Shopping list generation rejected: invalid daysAhead={DaysAhead} for group '{GroupId}'.", daysAhead, groupId);
            throw new ArgumentException("Days ahead must be between 1 and 28.");
        }

        var group = await _userGroupRepository.GetById(groupId)
            ?? throw new ArgumentException("Selected user group does not exist.");

        var existingActiveList = await _shoppingListRepository.GetActive(groupId);
        if (existingActiveList != null)
        {
            _logger.LogWarning("Shopping list generation rejected: active list already exists for group '{GroupId}'.", groupId);
            throw new ArgumentException("A shopping list is already active.");
        }

        var startDate = NormalizeDate(DateTime.UtcNow);
        var endDate = startDate.AddDays(daysAhead - 1);

        var ingredientRequirements = await BuildIngredientRequirements(groupId, startDate, endDate);
        var ingredients = await _ingredientRepository.GetAllIngredients(new IngredientFilterParams());
        var inventoryByIngredientId = await _inventoryRepository.GetStockByIngredientIds(
            groupId,
            ingredients.Select(item => item.Id).ToList());

        var ingredientsByName = ingredients
            .GroupBy(ingredient => ingredient.Name.Trim().ToLowerInvariant())
            .ToDictionary(group => group.Key, group => group.First());

        var items = new List<ShoppingListItem>();

        foreach (var requirement in ingredientRequirements
            .OrderBy(item => item.IngredientNameKey)
            .ThenBy(item => item.UoM))
        {
            if (!ingredientsByName.TryGetValue(requirement.IngredientNameKey, out var ingredient))
                continue;

            var reqQuantity = requirement.Quantity;
            var reqUoM = requirement.UoM;

            var stockQuantity = 0;
            if (inventoryByIngredientId.TryGetValue(ingredient.Id, out var stock))
            {
                var uoMMatches = string.Equals(stock.UoM, reqUoM, StringComparison.OrdinalIgnoreCase);
                if (uoMMatches)
                    stockQuantity = stock.Quantity;
            }

            var quantityToPurchase = Math.Max(0, reqQuantity - stockQuantity);
            if (quantityToPurchase <= 0)
                continue;

            items.Add(new ShoppingListItem(
                ingredientId: ingredient.Id,
                ingredientName: ingredient.Name,
                quantity: quantityToPurchase,
                uoM: reqUoM));
        }

        if (items.Count == 0)
        {
            _logger.LogInformation("Shopping list generation skipped: nothing to purchase for group '{GroupId}'.", groupId);
            throw new ArgumentException("Nothing to purchase — your inventory already covers the planned meals for this period.");
        }

        var shoppingList = new ShoppingList(
            id: Guid.NewGuid().ToString(),
            groupId: groupId,
            groupName: group.Name,
            startDate: startDate,
            endDate: endDate,
            items: items,
            createdAt: DateTime.UtcNow,
            lastModifiedBy: userId,
            lastModifiedAt: DateTime.UtcNow);

        await _shoppingListRepository.Insert(shoppingList);
        _logger.LogInformation("Shopping list generated for group '{GroupId}' covering {DaysAhead} days with {ItemCount} items.", groupId, daysAhead, items.Count);
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

        var group = await _userGroupRepository.GetById(groupId)
            ?? throw new ArgumentException("Selected user group does not exist.");

        shoppingList.UpdateGroupName(group.Name);

        if (isPurchased)
        {
            await _inventoryRepository.IncrementStockQuantity(
                groupId,
                group.Name,
                item.IngredientId,
                item.IngredientName,
                item.Quantity,
                item.UoM,
                userId);
        }
        else
        {
            await _inventoryRepository.IncrementStockQuantity(
                groupId,
                group.Name,
                item.IngredientId,
                item.IngredientName,
                -item.Quantity,
                item.UoM,
                userId);
        }

        shoppingList.SetItemPurchased(item.IngredientId, isPurchased, userId);
        await _shoppingListRepository.Replace(shoppingList);

        return shoppingList;
    }

    public async Task<ShoppingList> CompleteShoppingList(string userId, string username, string groupId, string shoppingListId)
    {
        var shoppingList = await _shoppingListRepository.GetById(groupId, shoppingListId)
            ?? throw new ArgumentException("Shopping list not found.");

        var group = await _userGroupRepository.GetById(groupId)
            ?? throw new ArgumentException("Selected user group does not exist.");

        shoppingList.UpdateGroupName(group.Name);

        if (shoppingList.IsCompleted)
            return shoppingList;

        if (!shoppingList.Items.Any(item => item.IsPurchased))
        {
            await _shoppingListRepository.Delete(shoppingListId);
        }

        shoppingList.Complete(userId, username);
        await _shoppingListRepository.Replace(shoppingList);

        return shoppingList;
    }

    public async Task<ShoppingList> CreateManualShoppingList(string userId, string groupId)
    {
        var existingActiveList = await _shoppingListRepository.GetActive(groupId);
        if (existingActiveList != null)
            throw new ArgumentException("A shopping list is already active.");

        var group = await _userGroupRepository.GetById(groupId)
            ?? throw new ArgumentException("Selected user group does not exist.");

        var now = DateTime.UtcNow;
        var startDate = NormalizeDate(now);
        var endDate = startDate.AddDays(6);

        var shoppingList = new ShoppingList(
            id: Guid.NewGuid().ToString(),
            groupId: groupId,
            groupName: group.Name,
            startDate: startDate,
            endDate: endDate,
            items: new List<ShoppingListItem>(),
            createdAt: DateTime.UtcNow,
            type: FoodAndDrinkDomain.Enums.ShoppingListType.Manual,
            lastModifiedBy: userId,
            lastModifiedAt: DateTime.UtcNow);

        await _shoppingListRepository.Insert(shoppingList);
        return shoppingList;
    }

    public async Task<ShoppingList> AddItemToShoppingList(string userId, string groupId, string shoppingListId, string ingredientId, string ingredientName, int quantity, string uoM)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        var shoppingList = await _shoppingListRepository.GetById(groupId, shoppingListId)
            ?? throw new ArgumentException("Shopping list not found.");

        if (shoppingList.IsCompleted)
            throw new ArgumentException("Completed shopping lists cannot be changed.");

        if (shoppingList.Type != FoodAndDrinkDomain.Enums.ShoppingListType.Manual)
            throw new ArgumentException("Items can only be added to manual shopping lists.");

        var group = await _userGroupRepository.GetById(groupId)
            ?? throw new ArgumentException("Selected user group does not exist.");

        shoppingList.UpdateGroupName(group.Name);
        shoppingList.AddItem(ingredientId, ingredientName, quantity, userId, string.IsNullOrWhiteSpace(uoM) ? "Portions" : uoM);
        await _shoppingListRepository.Replace(shoppingList);

        return shoppingList;
    }

    public async Task<ShoppingList> UpdateShoppingListItemQuantity(string userId, string groupId, string shoppingListId, string ingredientId, int quantity)
    {
        if (quantity < 0)
            throw new ArgumentException("Quantity cannot be negative.");

        var shoppingList = await _shoppingListRepository.GetById(groupId, shoppingListId)
            ?? throw new ArgumentException("Shopping list not found.");

        if (shoppingList.IsCompleted)
            throw new ArgumentException("Completed shopping lists cannot be changed.");

        var group = await _userGroupRepository.GetById(groupId)
            ?? throw new ArgumentException("Selected user group does not exist.");

        shoppingList.UpdateGroupName(group.Name);

        if (quantity == 0)
        {
            shoppingList.RemoveItem(ingredientId, userId);
        }
        else
        {
            shoppingList.UpdateItemQuantity(ingredientId, quantity, userId);
        }

        await _shoppingListRepository.Replace(shoppingList);

        return shoppingList;
    }

    public async Task<ShoppingList> RemoveItemFromShoppingList(string userId, string groupId, string shoppingListId, string ingredientId)
    {
        var shoppingList = await _shoppingListRepository.GetById(groupId, shoppingListId)
            ?? throw new ArgumentException("Shopping list not found.");

        if (shoppingList.IsCompleted)
            throw new ArgumentException("Completed shopping lists cannot be changed.");

        var group = await _userGroupRepository.GetById(groupId)
            ?? throw new ArgumentException("Selected user group does not exist.");

        shoppingList.UpdateGroupName(group.Name);
        shoppingList.RemoveItem(ingredientId, userId);
        await _shoppingListRepository.Replace(shoppingList);

        return shoppingList;
    }

    private async Task<List<ShoppingListIngredientRequirement>> BuildIngredientRequirements(string groupId, DateTime startDate, DateTime endDate)
    {
        var allRelevantDays = await _mealPlanRepository.GetDaysInRange(groupId, startDate, endDate);

        var mealIds = allRelevantDays
            .SelectMany(day => new[] { day.LunchMealId, day.DinnerMealId })
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id!)
            .ToList();

        if (mealIds.Count == 0)
            return new List<ShoppingListIngredientRequirement>();

        var meals = await _mealRepository.GetMealsByIds(mealIds);

        var totalMeals = mealIds.Select(id => meals.FirstOrDefault(m => m.Id == id)!).ToList();

        return totalMeals
            .SelectMany(meal => meal.Ingredients)
            .Where(ingredient => !string.IsNullOrWhiteSpace(ingredient.Name))
            .GroupBy(ingredient => new
            {
                IngredientNameKey = ingredient.Name.Trim().ToLowerInvariant(),
                UoM = string.IsNullOrWhiteSpace(ingredient.UoM)
                    ? "Portions"
                    : ingredient.UoM.Trim(),
            })
            .Select(group => new ShoppingListIngredientRequirement
            {
                IngredientNameKey = group.Key.IngredientNameKey,
                Quantity = (int)Math.Ceiling(group.Sum(item => item.Quantity ?? 1m)),
                UoM = group.Key.UoM,
            })
            .ToList();
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
