using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IFoodRepository
{
    Task<Food> GetFoodById(string id);
    Task<List<Food>> GetAllFood(FoodFilterParams filter);
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

    public async Task<List<Food>> GetAllFood(FoodFilterParams filter)
    {
        var fb = Builders<FoodDocument>.Filter;
        var filters = new List<FilterDefinition<FoodDocument>>();

        if (!string.IsNullOrWhiteSpace(filter.Search))
            filters.Add(fb.Regex(f => f.Name, new BsonRegularExpression(filter.Search, "i")));

        if (filter.IsHealthy == true)
            filters.Add(fb.Eq(f => f.IsHealthyOption, true));

        if (filter.MaxCost.HasValue)
            filters.Add(fb.Lte(f => f.Cost, filter.MaxCost.Value));

        if (filter.MaxRating.HasValue)
            filters.Add(fb.Lte(f => f.Rating, filter.MaxRating.Value));

        if (filter.MaxSpeed.HasValue)
            filters.Add(fb.Lte(f => f.Speed, filter.MaxSpeed.Value));

        if (filter.NewOrUpdated == true)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            filters.Add(fb.Or(
                fb.Gte(f => f.CreatedAt, oneWeekAgo),
                fb.Gte(f => f.UpdatedAt, oneWeekAgo)
            ));
        }

        var combined = filters.Count > 0
            ? fb.And(filters)
            : fb.Empty;

        var documents = await _collection.Find(combined).ToListAsync();

        return documents.Select(doc => (Food)doc).ToList();
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
