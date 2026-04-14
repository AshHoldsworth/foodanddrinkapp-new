using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;

namespace FoodAndDrinkService.Services;

public interface IDrinkService
{
    Task<List<Drink>> GetAllDrinks(DrinkFilterParams filter);
    Task<Drink> GetDrinkById(string id);
    Task AddDrink(Drink drink);
    Task DeleteDrink(string id);
}

public class DrinkService : IDrinkService
{
    private readonly IDrinkRepository _drinkRepository;

    public DrinkService(IDrinkRepository drinkRepository)
    {
        _drinkRepository = drinkRepository;
    }

    public async Task<List<Drink>> GetAllDrinks(DrinkFilterParams filter)
    {
        return await _drinkRepository.GetAllDrinks(filter);
    }

    public async Task<Drink> GetDrinkById(string id)
    {
        return await _drinkRepository.GetDrinkById(id);
    }

    public async Task AddDrink(Drink drink)
    {
        await _drinkRepository.AddDrink(drink);
    }

    public async Task DeleteDrink(string id)
    {
        await _drinkRepository.DeleteDrink(id);
    }
}