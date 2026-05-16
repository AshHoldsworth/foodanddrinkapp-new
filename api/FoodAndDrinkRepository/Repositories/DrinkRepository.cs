using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;

namespace FoodAndDrinkRepository.Repositories;

public interface IDrinkRepository
{
    Task<List<Drink>> GetAllDrinks(DrinkFilterParams filter);
    Task<Drink> GetDrinkById(string id);
    Task AddDrink(Drink drink);
    Task UpdateDrink(Drink drink);
    Task DeleteDrink(string id);
}

/// <summary>Drinks have been removed from this application. All methods throw NotSupportedException.</summary>
public class DrinkRepository : IDrinkRepository
{
    public Task<List<Drink>> GetAllDrinks(DrinkFilterParams filter) => throw new NotSupportedException("Drinks are not supported.");
    public Task<Drink> GetDrinkById(string id) => throw new NotSupportedException("Drinks are not supported.");
    public Task AddDrink(Drink drink) => throw new NotSupportedException("Drinks are not supported.");
    public Task UpdateDrink(Drink drink) => throw new NotSupportedException("Drinks are not supported.");
    public Task DeleteDrink(string id) => throw new NotSupportedException("Drinks are not supported.");
}
