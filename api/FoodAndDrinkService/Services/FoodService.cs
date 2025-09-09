using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkRepository.Repositories;

namespace FoodAndDrinkService.Services;

public interface IFoodService
{
    Task<Food> GetFoodById(string id);
    Task<List<Food>> GetAllFood();
    Task AddFood(Food food);
    Task UpdateFood(FoodUpdateDetails update);
    Task DeleteFood(string id);
}

public class FoodService : IFoodService
{
    private readonly IFoodRepository _foodRepository;

    public FoodService(IFoodRepository foodRepository)
    {
        _foodRepository = foodRepository;
    }
    
    public async Task<Food> GetFoodById(string id)
    {
        var food = await _foodRepository.GetFoodById(id);

        return food;
    }

    public async Task<List<Food>> GetAllFood()
    {
        return await _foodRepository.GetAllFood();
    }

    public async Task AddFood(Food food)
    {
        await _foodRepository.AddFood(food);
    }

    public async Task UpdateFood(FoodUpdateDetails update)
    {
        var food = await _foodRepository.GetFoodById(update.Id);
        food.Update(update);
        
        await _foodRepository.UpdateFood(food);
    }

    public async Task DeleteFood(string id)
    {
        await _foodRepository.DeleteFood(id);
    }
}
