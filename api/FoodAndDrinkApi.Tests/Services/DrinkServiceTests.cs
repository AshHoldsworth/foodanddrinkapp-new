using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using FoodAndDrinkService.Services;
using NSubstitute;
using Xunit;

namespace FoodAndDrinkApi.Tests.Services;

public class DrinkServiceTests
{
    private readonly IDrinkRepository _repository;
    private readonly DrinkService _service;

    public DrinkServiceTests()
    {
        _repository = Substitute.For<IDrinkRepository>();
        _service = new DrinkService(_repository);
    }

    [Fact]
    public async Task GetAllDrinks_ReturnsRepositoryData()
    {
        var drinks = new List<Drink>
        {
            new("d1", "Latte", 7, false, 2, [new MealIngredient("Milk", null)], 1, 2, DateTime.UtcNow),
        };

        _repository.GetAllDrinks(Arg.Any<DrinkFilterParams>()).Returns(Task.FromResult(drinks));

        var result = await _service.GetAllDrinks(new DrinkFilterParams());

        Assert.Single(result);
        Assert.Equal("d1", result[0].Id);
    }

    [Fact]
    public async Task AddDrink_ForwardsToRepository()
    {
        var drink = new Drink("d1", "Latte", 7, false, 2, [new MealIngredient("Milk", null)], 1, 2, DateTime.UtcNow);

        await _service.AddDrink(drink);

        await _repository.Received(1).AddDrink(drink);
    }

    [Fact]
    public async Task UpdateDrink_UpdatesAndPersistsDrink()
    {
        var existing = new Drink("d1", "Latte", 7, false, 2, [new MealIngredient("Milk", null)], 1, 2, DateTime.UtcNow);
        _repository.GetDrinkById("d1").Returns(Task.FromResult(existing));

        var update = new DrinkUpdateDetails
        {
            Id = "d1",
            Name = "Iced Latte",
        };

        await _service.UpdateDrink(update);

        await _repository.Received(1).UpdateDrink(Arg.Is<Drink>(drink => drink.Name == "Iced Latte"));
    }
}
