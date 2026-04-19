using System.Collections.Immutable;
using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IIngredientRepository
{
    Task<Ingredient> GetIngredientById(string id);
    Task<List<Ingredient>> GetAllIngredients(IngredientFilterParams filter);
    Task AddIngredient(Ingredient ingredient);
    Task UpdateIngredient(IngredientUpdateDetails update);
    Task DeleteIngredient(string id);
    Task<List<Ingredient>> GetIngredientsListByIds(List<string> ids);
}

public class IngredientRepository : IIngredientRepository
{
    private readonly IMongoCollection<IngredientDocument> _collection;

    public IngredientRepository(IMongoCollection<IngredientDocument> collection)
    {
        _collection = collection;
    }

    public async Task<Ingredient> GetIngredientById(string id)
    {
        var filter = Builders<IngredientDocument>.Filter.Eq(i => i.Id, id);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();

        if (document == null) throw new IngredientNotFoundException(id);

        return (Ingredient)document;
    }

    public async Task<List<Ingredient>> GetAllIngredients(IngredientFilterParams filter)
    {
        var fb = Builders<IngredientDocument>.Filter;
        var filters = new List<FilterDefinition<IngredientDocument>>();

        if (!string.IsNullOrWhiteSpace(filter.Search))
            filters.Add(fb.Regex(i => i.Name, new MongoDB.Bson.BsonRegularExpression(filter.Search, "i")));

        if (filter.IsHealthy == true)
            filters.Add(fb.Eq(i => i.IsHealthyOption, true));

        if (filter.MaxCost.HasValue)
            filters.Add(fb.Lte(i => i.Cost, filter.MaxCost.Value));

        if (filter.MaxRating.HasValue)
            filters.Add(fb.Lte(i => i.Rating, filter.MaxRating.Value));

        if (!string.IsNullOrWhiteSpace(filter.Macro))
            filters.Add(fb.Eq(i => i.Macro, filter.Macro));

        var combined = filters.Count > 0
            ? fb.And(filters)
            : fb.Empty;

        var documents = await _collection.Find(combined).ToListAsync();

        var ingredients = documents.Select(doc => (Ingredient)doc).ToList();

        return ingredients;
    }

    public async Task AddIngredient(Ingredient ingredient)
    {
        var filter = Builders<IngredientDocument>.Filter.Eq(i => i.Name, ingredient.Name);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();

        if (document != null) throw new IngredientAlreadyExistsException(ingredient.Name);

        await _collection.InsertOneAsync(ingredient);
    }

    public async Task UpdateIngredient(IngredientUpdateDetails update)
    {
        var filter = Builders<IngredientDocument>.Filter.Eq(i => i.Id, update.Id);

        var updateBuilder = Builders<IngredientDocument>.Update;
        var updates = new List<UpdateDefinition<IngredientDocument>>();

        if (update.Name != null) updates.Add(updateBuilder.Set(i => i.Name, update.Name));
        if (update.Rating != null) updates.Add(updateBuilder.Set(i => i.Rating, update.Rating));
        if (update.IsHealthyOption != null) updates.Add(updateBuilder.Set(i => i.IsHealthyOption, update.IsHealthyOption));
        if (update.Cost != null) updates.Add(updateBuilder.Set(i => i.Cost, update.Cost));
        if (update.Macro != null) updates.Add(updateBuilder.Set(i => i.Macro, update.Macro));
        if (update.Barcodes != null) updates.Add(updateBuilder.Set(i => i.Barcodes, update.Barcodes));
        updates.Add(updateBuilder.Set(i => i.UpdatedAt, DateTime.UtcNow));
        if (updates.Count == 0) return;

        var result = await _collection.UpdateOneAsync(filter, updateBuilder.Combine(updates));

        if (result.MatchedCount == 0) throw new IngredientNotFoundException(update.Id);
    }

    public async Task DeleteIngredient(string id)
    {
        var filter = Builders<IngredientDocument>.Filter.Eq(i => i.Id, id);

        var result = await _collection.DeleteOneAsync(filter);

        if (result.DeletedCount == 0) throw new IngredientNotFoundException(id);
    }

    public async Task<List<Ingredient>> GetIngredientsListByIds(List<string> ids)
    {
        var filter = Builders<IngredientDocument>.Filter.In(i => i.Id, ids);

        var documents = await _collection.Find(filter).ToListAsync();

        if (documents.Count == 0) throw new IngredientNotFoundException(ids.First());

        var ingredients = documents.Select(doc => (Ingredient)doc).ToList();

        if (ingredients.Count != ids.Count) throw new NoIngredientsFoundException();

        return ingredients;
    }
}
