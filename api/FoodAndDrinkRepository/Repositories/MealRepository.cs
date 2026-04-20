using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IMealRepository
{
    Task<Meal> GetMealById(string id);
    Task<List<Meal>> GetAllMeal(MealFilterParams filter);
    Task<HashSet<string>> GetExistingMealIds(IEnumerable<string> ids);
    Task AddMeal(Meal meal);
    Task UpdateMeal(Meal meal);
    Task DeleteMeal(string id);
}

public class MealRepository : IMealRepository
{
    private readonly IMongoCollection<MealDocument> _collection;
    
    public MealRepository(IMongoCollection<MealDocument> collection)
    {
        _collection = collection;
    }
    
    public async Task<Meal> GetMealById(string id)
    {
        var filter = Builders<MealDocument>.Filter.Eq(meal => meal.Id, id);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();
        
        if (document == null) throw new MealNotFoundException(id);
        
        return (Meal)document;
    }

    public async Task<List<Meal>> GetAllMeal(MealFilterParams filter)
    {
        var fb = Builders<MealDocument>.Filter;
        var filters = new List<FilterDefinition<MealDocument>>();

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

        return documents.Select(doc => (Meal)doc).ToList();
    }

    public async Task<HashSet<string>> GetExistingMealIds(IEnumerable<string> ids)
    {
        var normalizedIds = ids
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct()
            .ToList();

        if (normalizedIds.Count == 0)
            return [];

        var filter = Builders<MealDocument>.Filter.In(meal => meal.Id, normalizedIds);
        var documents = await _collection.Find(filter).Project(meal => meal.Id).ToListAsync();

        return documents.ToHashSet();
    }

    public async Task AddMeal(Meal meal)
    {
        var filter = Builders<MealDocument>.Filter.Eq(doc => doc.Name, meal.Name);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();
        
        if (document != null) throw new MealAlreadyExistsException(meal.Name);
        
        await _collection.InsertOneAsync(meal);
    }

    public async Task UpdateMeal(Meal meal)
    {
        var filter = Builders<MealDocument>.Filter.Eq(f => f.Id, meal.Id);
        
        var result = await _collection.ReplaceOneAsync(filter, meal);
        
        if (result.MatchedCount == 0) throw new MealNotFoundException(meal.Id);
    }

    public async Task DeleteMeal(string id)
    {
        var filter = Builders<MealDocument>.Filter.Eq(meal => meal.Id, id);
        
        var result = await _collection.DeleteOneAsync(filter);
        
        if (result.DeletedCount == 0) throw new MealNotFoundException(id);
    }
}
