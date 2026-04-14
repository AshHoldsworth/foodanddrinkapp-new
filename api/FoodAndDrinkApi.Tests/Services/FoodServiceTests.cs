using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using FoodAndDrinkService.Services;
using NSubstitute;
using Xunit;

namespace FoodAndDrinkApi.Tests.Services;

public class FoodServiceTests
{
    private readonly IFoodRepository _repository;
    private readonly FoodService _service;

    public FoodServiceTests()
    {
        _repository = Substitute.For<IFoodRepository>();
        _service = new FoodService(_repository);
    }

    [Fact]
    public async Task GetFoodById_ReturnsRepositoryResult()
    {
        var food = new Food("f1", "Pasta", 8, true, 2, ["Tomato"], "Dinner", 2, 2, DateTime.UtcNow);
        _repository.GetFoodById("f1").Returns(Task.FromResult(food));

        var result = await _service.GetFoodById("f1");

        Assert.Equal("f1", result.Id);
        await _repository.Received(1).GetFoodById("f1");
    }

    [Fact]
    public async Task UpdateFood_UpdatesAndPersistsFood()
    {
        var existing = new Food("f1", "Pasta", 8, true, 2, ["Tomato"], "Dinner", 2, 2, DateTime.UtcNow);
        _repository.GetFoodById("f1").Returns(Task.FromResult(existing));

        var update = new FoodUpdateDetails
        {
            Id = "f1",
            Name = "Updated Pasta",
        };

        await _service.UpdateFood(update);

        await _repository.Received(1).UpdateFood(Arg.Is<Food>(f => f.Name == "Updated Pasta"));
    }
}
