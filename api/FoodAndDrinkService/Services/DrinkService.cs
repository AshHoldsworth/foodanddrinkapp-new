using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;

namespace FoodAndDrinkService.Services;

public interface IDrinkService
{
    Task<List<Drink>> GetAllDrinks(DrinkFilterParams filter);
    Task<Drink> GetDrinkById(string id);
    Task AddDrink(Drink drink);
    Task UpdateDrink(DrinkUpdateDetails update);
    Task DeleteDrink(string id);
}

/// <summary>Drinks are not supported. All methods throw NotSupportedException.</summary>
public class DrinkService : IDrinkService
{
    public DrinkService(IDrinkRepository _) { }

    public Task<List<Drink>> GetAllDrinks(DrinkFilterParams filter) => throw new NotSupportedException("Drinks are not supported.");
    public Task<Drink> GetDrinkById(string id) => throw new NotSupportedException("Drinks are not supported.");
    public Task AddDrink(Drink drink) => throw new NotSupportedException("Drinks are not supported.");
    public Task UpdateDrink(DrinkUpdateDetails update) => throw new NotSupportedException("Drinks are not supported.");
    public Task DeleteDrink(string id) => throw new NotSupportedException("Drinks are not supported.");
}
