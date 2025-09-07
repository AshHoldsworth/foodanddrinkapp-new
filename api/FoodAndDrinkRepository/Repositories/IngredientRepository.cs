using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IIngredientRepository
{
    Task<Ingredient> GetIngredientById(string id);
    Task<List<Ingredient>> GetAllIngredients();
    Task AddIngredient(Ingredient ingredient);
    Task UpdateIngredient(IngredientUpdateDetails update);
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

    public async Task<List<Ingredient>> GetAllIngredients()
    {
        var documents = await _collection.Find(i => true).ToListAsync();
        
        var ingredients = documents.Select(doc => (Ingredient)doc).ToList();

        if (ingredients.Count == 0) throw new NoIngredientsFoundException();
        
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
        if (updates.Count == 0) return;
        
        var result = await _collection.UpdateOneAsync(filter, updateBuilder.Combine(updates));

        if (result.MatchedCount == 0) throw new IngredientNotFoundException(update.Id);
    }
}