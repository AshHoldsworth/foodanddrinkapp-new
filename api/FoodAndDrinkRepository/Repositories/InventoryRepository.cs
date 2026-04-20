using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IInventoryRepository
{
    Task<Dictionary<string, int>> GetStockByIngredientIds(string groupId, List<string> ingredientIds);
    Task SetStockQuantity(string groupId, string ingredientId, int stockQuantity);
    Task IncrementStockQuantity(string groupId, string ingredientId, int amount);
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

        var fb = Builders<InventoryDocument>.Filter;
        var filter = fb.And(
            fb.Eq(i => i.GroupId, groupId),
            fb.In(i => i.IngredientId, ingredientIds)
        );

        var documents = await _collection.Find(filter).ToListAsync();

        return documents
            .GroupBy(item => item.IngredientId)
            .ToDictionary(group => group.Key, group => group.Last().StockQuantity);
    }

    public async Task SetStockQuantity(string groupId, string ingredientId, int stockQuantity)
    {
        var fb = Builders<InventoryDocument>.Filter;
        var filter = fb.And(
            fb.Eq(i => i.GroupId, groupId),
            fb.Eq(i => i.IngredientId, ingredientId)
        );

        var update = Builders<InventoryDocument>.Update
            .Set(i => i.StockQuantity, stockQuantity)
            .Set(i => i.UpdatedAt, DateTime.UtcNow)
            .SetOnInsert(i => i.Id, ObjectId.GenerateNewId().ToString())
            .SetOnInsert(i => i.GroupId, groupId)
            .SetOnInsert(i => i.IngredientId, ingredientId);

        await _collection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
    }

    public async Task IncrementStockQuantity(string groupId, string ingredientId, int amount)
    {
        var existing = await GetStockByIngredientIds(groupId, [ingredientId]);
        var current = existing.TryGetValue(ingredientId, out var quantity) ? quantity : 0;
        var next = current + amount;

        if (next < 0)
        {
            throw new ArgumentException("Ingredient stock cannot be reduced below zero.");
        }

        await SetStockQuantity(groupId, ingredientId, next);
    }

    public async Task DeleteByIngredientId(string ingredientId)
    {
        var filter = Builders<InventoryDocument>.Filter.Eq(i => i.IngredientId, ingredientId);
        await _collection.DeleteManyAsync(filter);
    }
}
