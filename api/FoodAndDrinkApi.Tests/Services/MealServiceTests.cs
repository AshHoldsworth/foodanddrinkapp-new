using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using FoodAndDrinkService.Services;
using NSubstitute;
using Xunit;

namespace FoodAndDrinkApi.Tests.Services;

public class MealServiceTests
{
    private readonly IMealRepository _repository;
    private readonly MealService _service;

    public MealServiceTests()
    {
        _repository = Substitute.For<IMealRepository>();
        _service = new MealService(_repository);
    }

    [Fact]
    public async Task GetMealById_ReturnsRepositoryResult()
    {
        var meal = new Meal("f1", "Pasta", 8, true, 2, ["Tomato"], "Dinner", 2, 2, DateTime.UtcNow);
        _repository.GetMealById("f1").Returns(Task.FromResult(meal));

        var result = await _service.GetMealById("f1");

        Assert.Equal("f1", result.Id);
        await _repository.Received(1).GetMealById("f1");
    }

    [Fact]
    public async Task UpdateMeal_UpdatesAndPersistsMeal()
    {
        var existing = new Meal("f1", "Pasta", 8, true, 2, ["Tomato"], "Dinner", 2, 2, DateTime.UtcNow);
        _repository.GetMealById("f1").Returns(Task.FromResult(existing));

        var update = new MealUpdateDetails
        {
            Id = "f1",
            Name = "Updated Pasta",
        };

        await _service.UpdateMeal(update);

        await _repository.Received(1).UpdateMeal(Arg.Is<Meal>(f => f.Name == "Updated Pasta"));
    }
}
