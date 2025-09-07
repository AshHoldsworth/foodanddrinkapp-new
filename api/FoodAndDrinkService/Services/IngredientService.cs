using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkRepository.Repositories;

namespace FoodAndDrinkService.Services;

public interface IIngredientService
{
    Task AddIngredient(Ingredient ingredient);
    Task UpdateIngredient(IngredientUpdateDetails update);
    Task<Ingredient> GetIngredientById(string id);
    Task<List<Ingredient>> GetAllIngredients();
}

public class IngredientService : IIngredientService
{
    private readonly IIngredientRepository _repository;

    public IngredientService(IIngredientRepository repository)
    {
        _repository = repository;
    }
    
    public async Task AddIngredient(Ingredient ingredient)
    {
        await _repository.AddIngredient(ingredient);
    }

    public async Task UpdateIngredient(IngredientUpdateDetails update)
    {
        if (update.Id == null) throw new IngredientIdIsNullException();

        if (update.Name == null &&
            update.Rating == null &&
            update.IsHealthyOption == null &&
            update.Cost == null &&
            update.Macro == null &&
            update.Barcodes == null)
        {
            throw new IngredientNoUpdatesDetectedException();
        }
        
        await _repository.UpdateIngredient(update);
    }

    public async Task<Ingredient> GetIngredientById(string id)
    {
        return await _repository.GetIngredientById(id);
    }

    public async Task<List<Ingredient>> GetAllIngredients()
    {
        return await _repository.GetAllIngredients();
    }
}