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
    public async Task GetAllDrinks_ThrowsNotSupported()
    {
        await Assert.ThrowsAsync<NotSupportedException>(() =>
            _service.GetAllDrinks(new DrinkFilterParams()));
    }

    [Fact]
    public async Task AddDrink_ThrowsNotSupported()
    {
        var drink = new Drink("d1", "Latte", false, [], DateTime.UtcNow);
        await Assert.ThrowsAsync<NotSupportedException>(() => _service.AddDrink(drink));
    }

    [Fact]
    public async Task DeleteDrink_ThrowsNotSupported()
    {
        await Assert.ThrowsAsync<NotSupportedException>(() => _service.DeleteDrink("d1"));
    }
}
