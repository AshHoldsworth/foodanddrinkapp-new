using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IInventoryRepository
{
    Task<Dictionary<string, int>> GetStockByIngredientIds(string groupId, List<string> ingredientIds);
    Task SetStockQuantity(string groupId, string groupName, string ingredientId, string ingredientName, int stockQuantity);
    Task IncrementStockQuantity(string groupId, string groupName, string ingredientId, string ingredientName, int amount);
    Task DeleteByIngredientId(string ingredientId);
}

public class InventoryRepository : IInventoryRepository
{
    private readonly IMongoCollection<InventoryDocument> _collection;

    public InventoryRepository(IMongoCollection<InventoryDocument> collection)
    {
        _collection = collection;
    }

    public async Task<Dictionary<string, int>> GetStockByIngredientIds(string groupId, List<string> ingredientIds)
    {
        if (ingredientIds.Count == 0)
        {
            return new Dictionary<string, int>();
        }

        var inventory = await GetByGroupId(groupId);
        if (inventory == null)
        {
            return new Dictionary<string, int>();
        }

        var ingredientIdSet = ingredientIds.ToHashSet();
        return inventory.Products
            .Where(product => ingredientIdSet.Contains(product.IngredientId))
            .ToDictionary(product => product.IngredientId, product => product.StockQuantity);
    }

    public async Task SetStockQuantity(string groupId, string groupName, string ingredientId, string ingredientName, int stockQuantity)
    {
        var inventory = await GetByGroupId(groupId);
        var now = DateTime.UtcNow;

        if (inventory == null)
        {
            var newInventory = new InventoryDocument
            {
                Id = ObjectId.GenerateNewId().ToString(),
                GroupId = groupId,
                GroupName = groupName,
                Products =
                [
                    new InventoryProductDocument
                    {
                        IngredientId = ingredientId,
                        IngredientName = ingredientName,
                        StockQuantity = stockQuantity,
                    },
                ],
                UpdatedAt = now,
            };

            await _collection.InsertOneAsync(newInventory);
            return;
        }

        var updatedProducts = inventory.Products
            .Select(product => product.IngredientId == ingredientId
                ? new InventoryProductDocument
                {
                    IngredientId = product.IngredientId,
                    IngredientName = ingredientName,
                    StockQuantity = stockQuantity,
                }
                : product)
            .ToList();

        if (!updatedProducts.Any(product => product.IngredientId == ingredientId))
        {
            updatedProducts.Add(new InventoryProductDocument
            {
                IngredientId = ingredientId,
                IngredientName = ingredientName,
                StockQuantity = stockQuantity,
            });
        }

        var filter = Builders<InventoryDocument>.Filter.Eq(item => item.Id, inventory.Id);
        var update = Builders<InventoryDocument>.Update
            .Set(item => item.GroupName, groupName)
            .Set(item => item.Products, updatedProducts)
            .Set(item => item.UpdatedAt, now);

        await _collection.UpdateOneAsync(filter, update);
    }

    public async Task IncrementStockQuantity(string groupId, string groupName, string ingredientId, string ingredientName, int amount)
    {
        var existing = await GetStockByIngredientIds(groupId, [ingredientId]);
        var current = existing.TryGetValue(ingredientId, out var quantity) ? quantity : 0;
        var next = current + amount;

        if (next < 0)
        {
            throw new ArgumentException("Ingredient stock cannot be reduced below zero.");
        }

        await SetStockQuantity(groupId, groupName, ingredientId, ingredientName, next);
    }

    public async Task DeleteByIngredientId(string ingredientId)
    {
        var filter = Builders<InventoryDocument>.Filter.Empty;
        var update = Builders<InventoryDocument>.Update.PullFilter(
            item => item.Products,
            product => product.IngredientId == ingredientId);

        await _collection.UpdateManyAsync(filter, update);
    }

    private async Task<InventoryDocument?> GetByGroupId(string groupId)
    {
        var filter = Builders<InventoryDocument>.Filter.Eq(item => item.GroupId, groupId);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }
}
