using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkRepository.Repositories;

namespace FoodAndDrinkService.Services;

public interface IIngredientService
{
    Task AddIngredient(Ingredient ingredient);
    Task UpdateIngredient(IngredientUpdateDetails update, string? groupId);
    Task UpdateIngredientStocks(List<IngredientUpdateDetails> updates, string groupId);
    Task<Ingredient> GetIngredientById(string id, string? groupId);
    Task<List<Ingredient>> GetAllIngredients(IngredientFilterParams filter, string? groupId);
    Task DeleteIngredient(string id);
    Task<List<Ingredient>> GetIngredientsListByIds(List<string> ids);
}

public class IngredientService : IIngredientService
{
    private readonly IIngredientRepository _repository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IUserGroupRepository _userGroupRepository;

    public IngredientService(
        IIngredientRepository repository,
        IInventoryRepository inventoryRepository,
        IUserGroupRepository userGroupRepository)
    {
        _repository = repository;
        _inventoryRepository = inventoryRepository;
        _userGroupRepository = userGroupRepository;
    }

    public async Task AddIngredient(Ingredient ingredient)
    {
        await _repository.AddIngredient(ingredient);
    }

    public async Task UpdateIngredient(IngredientUpdateDetails update, string? groupId)
    {
        if (update.Id == null) throw new IngredientIdIsNullException();

        var hasBaseUpdates =
            update.Name != null ||
            update.Rating != null ||
            update.IsHealthyOption != null ||
            update.Cost != null ||
            update.Macro != null ||
            update.Barcodes != null;

        var hasStockUpdate = update.StockQuantity != null;

        if (!hasBaseUpdates && !hasStockUpdate)
        {
            throw new IngredientNoUpdatesDetectedException();
        }

        if (hasBaseUpdates)
        {
            var baseUpdate = new IngredientUpdateDetails
            {
                Id = update.Id,
                Name = update.Name,
                Rating = update.Rating,
                IsHealthyOption = update.IsHealthyOption,
                Cost = update.Cost,
                Macro = update.Macro,
                StockQuantity = null,
                Barcodes = update.Barcodes,
            };

            await _repository.UpdateIngredient(baseUpdate);
        }

        if (hasStockUpdate)
        {
            if (string.IsNullOrWhiteSpace(groupId))
                throw new ArgumentException("User group is required for inventory updates.");

            if (update.StockQuantity < 0)
                throw new ArgumentException("Ingredient stock cannot be reduced below zero.");

            var group = await _userGroupRepository.GetById(groupId)
                ?? throw new ArgumentException("Selected user group does not exist.");

            var ingredientName = update.Name;
            if (string.IsNullOrWhiteSpace(ingredientName))
            {
                var ingredient = await _repository.GetIngredientById(update.Id);
                ingredientName = ingredient.Name;
            }

            await _inventoryRepository.SetStockQuantity(
                groupId,
                group.Name,
                update.Id,
                ingredientName,
                update.StockQuantity!.Value);
        }
    }

    public async Task UpdateIngredientStocks(List<IngredientUpdateDetails> updates, string groupId)
    {
        if (updates.Count == 0) throw new IngredientNoUpdatesDetectedException();

        foreach (var update in updates)
        {
            await UpdateIngredient(update, groupId);
        }
    }

    public async Task<Ingredient> GetIngredientById(string id, string? groupId)
    {
        var ingredient = await _repository.GetIngredientById(id);

        if (string.IsNullOrWhiteSpace(groupId))
        {
            return WithStockQuantity(ingredient, 0);
        }

        var stockByIngredientId = await _inventoryRepository.GetStockByIngredientIds(groupId, [id]);
        var stockQuantity = stockByIngredientId.TryGetValue(id, out var quantity) ? quantity : 0;

        return WithStockQuantity(ingredient, stockQuantity);
    }

    public async Task<List<Ingredient>> GetAllIngredients(IngredientFilterParams filter, string? groupId)
    {
        var repositoryFilter = new IngredientFilterParams
        {
            Search = filter.Search,
            IsHealthy = filter.IsHealthy,
            MaxCost = filter.MaxCost,
            MaxRating = filter.MaxRating,
            Macro = filter.Macro,
            InStockOnly = null,
        };

        var ingredients = await _repository.GetAllIngredients(repositoryFilter);

        if (string.IsNullOrWhiteSpace(groupId))
        {
            return ingredients
                .Select(ingredient => WithStockQuantity(ingredient, 0))
                .Where(ingredient => filter.InStockOnly != true || ingredient.StockQuantity > 0)
                .ToList();
        }

        var stockByIngredientId = await _inventoryRepository.GetStockByIngredientIds(
            groupId,
            ingredients.Select(item => item.Id).ToList());

        return ingredients
            .Select(ingredient =>
            {
                var stockQuantity = stockByIngredientId.TryGetValue(ingredient.Id, out var quantity)
                    ? quantity
                    : 0;

                return WithStockQuantity(ingredient, stockQuantity);
            })
            .Where(ingredient => filter.InStockOnly != true || ingredient.StockQuantity > 0)
            .ToList();
    }

    public async Task DeleteIngredient(string id)
    {
        await _repository.DeleteIngredient(id);
        await _inventoryRepository.DeleteByIngredientId(id);
    }

    public async Task<List<Ingredient>> GetIngredientsListByIds(List<string> ids)
    {
        return await _repository.GetIngredientsListByIds(ids);
    }

    private static Ingredient WithStockQuantity(Ingredient ingredient, int stockQuantity)
    {
        return new Ingredient(
            id: ingredient.Id,
            name: ingredient.Name,
            rating: ingredient.Rating,
            isHealthyOption: ingredient.IsHealthyOption,
            cost: ingredient.Cost,
            macro: ingredient.Macro,
            barcodes: ingredient.Barcodes,
            createdAt: ingredient.CreatedAt,
            updatedAt: ingredient.UpdatedAt,
            stockQuantity: stockQuantity
        );
    }
}
