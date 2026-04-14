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
            new("d1", "Latte", 7, false, 2, ["Milk"], 1, 2, DateTime.UtcNow),
        };

        _repository.GetAllDrinks(Arg.Any<DrinkFilterParams>()).Returns(Task.FromResult(drinks));

        var result = await _service.GetAllDrinks(new DrinkFilterParams());

        Assert.Single(result);
        Assert.Equal("d1", result[0].Id);
    }

    [Fact]
    public async Task AddDrink_ForwardsToRepository()
    {
        var drink = new Drink("d1", "Latte", 7, false, 2, ["Milk"], 1, 2, DateTime.UtcNow);

        await _service.AddDrink(drink);

        await _repository.Received(1).AddDrink(drink);
    }
}
