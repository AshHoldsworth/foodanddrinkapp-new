using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkRepository.Repositories;

namespace FoodAndDrinkService.Services;

public interface IMealService
{
    Task<Meal> GetMealById(string id);
    Task<List<Meal>> GetAllMeal(MealFilterParams filter);
    Task AddMeal(Meal meal);
    Task UpdateMeal(MealUpdateDetails update);
    Task DeleteMeal(string id);
}

public class MealService : IMealService
{
    private readonly IMealRepository _mealRepository;

    public MealService(IMealRepository mealRepository)
    {
        _mealRepository = mealRepository;
    }
    
    public async Task<Meal> GetMealById(string id)
    {
        var meal = await _mealRepository.GetMealById(id);

        return meal;
    }

    public async Task<List<Meal>> GetAllMeal(MealFilterParams filter)
    {
        return await _mealRepository.GetAllMeal(filter);
    }

    public async Task AddMeal(Meal meal)
    {
        await _mealRepository.AddMeal(meal);
    }

    public async Task UpdateMeal(MealUpdateDetails update)
    {
        var meal = await _mealRepository.GetMealById(update.Id);
        meal.Update(update);
        
        await _mealRepository.UpdateMeal(meal);
    }

    public async Task DeleteMeal(string id)
    {
        await _mealRepository.DeleteMeal(id);
    }
}
