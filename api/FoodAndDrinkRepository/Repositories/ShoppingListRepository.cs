using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IShoppingListRepository
{
    Task<ShoppingList?> GetActive();
    Task<ShoppingList?> GetById(string id);
    Task<List<ShoppingList>> GetCompleted(int limit);
    Task Insert(ShoppingList shoppingList);
    Task Replace(ShoppingList shoppingList);
}

public class ShoppingListRepository : IShoppingListRepository
{
    private readonly IMongoCollection<ShoppingListDocument> _collection;

    public ShoppingListRepository(IMongoCollection<ShoppingListDocument> collection)
    {
        _collection = collection;
    }

    public async Task<ShoppingList?> GetActive()
    {
        var filter = Builders<ShoppingListDocument>.Filter.Eq(list => list.IsCompleted, false);

        var document = await _collection
            .Find(filter)
            .SortByDescending(list => list.CreatedAt)
            .FirstOrDefaultAsync();

        return document == null ? null : (ShoppingList)document;
    }

    public async Task<ShoppingList?> GetById(string id)
    {
        var filter = Builders<ShoppingListDocument>.Filter.Eq(list => list.Id, id);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();

        return document == null ? null : (ShoppingList)document;
    }

    public async Task<List<ShoppingList>> GetCompleted(int limit)
    {
        var filter = Builders<ShoppingListDocument>.Filter.Eq(list => list.IsCompleted, true);
        var documents = await _collection
            .Find(filter)
            .SortByDescending(list => list.CompletedAt)
            .Limit(limit)
            .ToListAsync();

        return documents.Select(doc => (ShoppingList)doc).ToList();
    }

    public async Task Insert(ShoppingList shoppingList)
    {
        await _collection.InsertOneAsync(shoppingList);
    }

    public async Task Replace(ShoppingList shoppingList)
    {
        var filter = Builders<ShoppingListDocument>.Filter.Eq(list => list.Id, shoppingList.Id);
        await _collection.ReplaceOneAsync(filter, shoppingList);
    }
}
