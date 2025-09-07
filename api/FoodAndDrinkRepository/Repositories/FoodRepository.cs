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
    Task UpdateFood(FoodUpdateDetails update);
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

    public async Task UpdateFood(FoodUpdateDetails update)
    {
        var filter = Builders<FoodDocument>.Filter.Eq(food => food.Id, update.Id);
        
        var updateBuilder = Builders<FoodDocument>.Update;
        var updates = new List<UpdateDefinition<FoodDocument>>();
        
        if (update.Name != null) updates.Add(updateBuilder.Set(food => food.Name, update.Name));
        if (update.Rating != null) updates.Add(updateBuilder.Set(food => food.Rating, update.Rating));
        if (update.IsHealthyOption != null) updates.Add(updateBuilder.Set(food => food.IsHealthyOption, update.IsHealthyOption));
        if (update.Cost != null) updates.Add(updateBuilder.Set(food => food.Cost, update.Cost));
        if (update.Course != null) updates.Add(updateBuilder.Set(food => food.Course, update.Course));
        if (update.Difficulty != null) updates.Add(updateBuilder.Set(food => food.Difficulty, update.Difficulty));
        if (update.Speed != null) updates.Add(updateBuilder.Set(food => food.Speed, update.Speed));
        if (update.Ingredients != null) updates.Add(updateBuilder.Set(food => food.Ingredients, update.Ingredients));
        if (updates.Count == 0) return;
        
        var result = await _collection.UpdateOneAsync(filter, updateBuilder.Combine(updates));
        
        if (result.MatchedCount == 0) throw new FoodNotFoundException(update.Id);
    }

    public async Task DeleteFood(string id)
    {
        var filter = Builders<FoodDocument>.Filter.Eq(food => food.Id, id);
        
        var result = await _collection.DeleteOneAsync(filter);
        
        if (result.DeletedCount == 0) throw new FoodNotFoundException(id);
    }
}
