using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IDrinkRepository
{
    Task<List<Drink>> GetAllDrinks(DrinkFilterParams filter);
    Task<Drink> GetDrinkById(string id);
    Task AddDrink(Drink drink);
    Task DeleteDrink(string id);
}

public class DrinkRepository : IDrinkRepository
{
    private readonly IMongoCollection<DrinkDocument> _collection;

    public DrinkRepository(IMongoCollection<DrinkDocument> collection)
    {
        _collection = collection;
    }

    public async Task<List<Drink>> GetAllDrinks(DrinkFilterParams filter)
    {
        var fb = Builders<DrinkDocument>.Filter;
        var filters = new List<FilterDefinition<DrinkDocument>>();

        if (!string.IsNullOrWhiteSpace(filter.Search))
            filters.Add(fb.Regex(d => d.Name, new BsonRegularExpression(filter.Search, "i")));

        if (filter.IsHealthy == true)
            filters.Add(fb.Eq(d => d.IsHealthyOption, true));

        if (filter.MaxCost.HasValue)
            filters.Add(fb.Lte(d => d.Cost, filter.MaxCost.Value));

        if (filter.MaxRating.HasValue)
            filters.Add(fb.Lte(d => d.Rating, filter.MaxRating.Value));

        if (filter.MaxSpeed.HasValue)
            filters.Add(fb.Lte(d => d.Speed, filter.MaxSpeed.Value));

        if (filter.NewOrUpdated == true)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            filters.Add(fb.Or(
                fb.Gte(d => d.CreatedAt, oneWeekAgo),
                fb.Gte(d => d.UpdatedAt, oneWeekAgo)
            ));
        }

        var combined = filters.Count > 0 ? fb.And(filters) : fb.Empty;
        var documents = await _collection.Find(combined).ToListAsync();

        return documents.Select(doc => (Drink)doc).ToList();
    }

    public async Task<Drink> GetDrinkById(string id)
    {
        var filter = Builders<DrinkDocument>.Filter.Eq(d => d.Id, id);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();

        if (document == null) throw new DrinkNotFoundException(id);

        return (Drink)document;
    }

    public async Task AddDrink(Drink drink)
    {
        var filter = Builders<DrinkDocument>.Filter.Eq(d => d.Name, drink.Name);
        var existing = await _collection.Find(filter).FirstOrDefaultAsync();

        if (existing != null) throw new DrinkAlreadyExistsException(drink.Name);

        await _collection.InsertOneAsync(drink);
    }

    public async Task DeleteDrink(string id)
    {
        var filter = Builders<DrinkDocument>.Filter.Eq(d => d.Id, id);
        var result = await _collection.DeleteOneAsync(filter);

        if (result.DeletedCount == 0) throw new DrinkNotFoundException(id);
    }
}
