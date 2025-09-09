using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IFoodRepository
{
    Task<Food> GetFoodById(string id);
    Task<List<Food>> GetAllFood();
    Task AddFood(Food food);
    Task UpdateFood(Food food);
    Task DeleteFood(string id);
}

public class FoodRepository : IFoodRepository
{
    private readonly IMongoCollection<FoodDocument> _collection;
    
    public FoodRepository(IMongoCollection<FoodDocument> collection)
    {
        _collection = collection;
    }
    
    public async Task<Food> GetFoodById(string id)
    {
        var filter = Builders<FoodDocument>.Filter.Eq(food => food.Id, id);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();
        
        if (document == null) throw new FoodNotFoundException(id);
        
        return (Food)document;
    }

    public async Task<List<Food>> GetAllFood()
    {
        var documents = await _collection.Find(food => true).ToListAsync();

        if (documents.Count == 0) throw new NoFoodsFoundException();
        
        var foodList = documents.Select(doc => (Food)doc).ToList();
        
        return foodList;
    }

    public async Task AddFood(Food food)
    {
        var filter = Builders<FoodDocument>.Filter.Eq(doc => doc.Name, food.Name);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();
        
        if (document != null) throw new FoodAlreadyExistsException(food.Name);
        
        await _collection.InsertOneAsync(food);
    }

    public async Task UpdateFood(Food food)
    {
        var filter = Builders<FoodDocument>.Filter.Eq(f => f.Id, food.Id);
        
        var result = await _collection.ReplaceOneAsync(filter, food);
        
        if (result.MatchedCount == 0) throw new FoodNotFoundException(food.Id);
    }

    public async Task DeleteFood(string id)
    {
        var filter = Builders<FoodDocument>.Filter.Eq(food => food.Id, id);
        
        var result = await _collection.DeleteOneAsync(filter);
        
        if (result.DeletedCount == 0) throw new FoodNotFoundException(id);
    }
}
