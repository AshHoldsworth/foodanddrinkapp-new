using System.Net;
using FoodAndDrinkApi.Controllers;
using FoodAndDrinkApi.Requests;
using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace FoodAndDrinkApi.Tests.Controllers;

public class DrinkControllerTests
{
    private readonly IDrinkService _drinkService;
    private readonly DrinkController _controller;

    public DrinkControllerTests()
    {
        _drinkService = Substitute.For<IDrinkService>();
        var logger = Substitute.For<ILogger<DrinkController>>();
        _controller = new DrinkController(_drinkService, logger);
    }

    [Fact]
    public async Task GetDrinkById_WhenFound_ReturnsOk()
    {
        var drink = new Drink(
            id: "drink-1",
            name: "Latte",
            rating: 7,
            isHealthyOption: false,
            cost: 2,
            ingredients: ["Milk"],
            difficulty: 1,
            speed: 2,
            createdAt: DateTime.UtcNow);

        _drinkService.GetDrinkById("drink-1").Returns(Task.FromResult(drink));

        var response = await _controller.GetDrinkById("drink-1");

        Assert.Equal(HttpStatusCode.OK, ControllerTestHelpers.GetStatusCode(response));
        Assert.Null(response.ErrorMessage);
    }

    [Fact]
    public async Task GetDrinkById_WhenMissing_ReturnsNotFound()
    {
        _drinkService.GetDrinkById("missing-id")
            .Returns(Task.FromException<Drink>(new DrinkNotFoundException("missing-id")));

        var response = await _controller.GetDrinkById("missing-id");

        Assert.Equal(HttpStatusCode.NotFound, ControllerTestHelpers.GetStatusCode(response));
        Assert.Equal("DRINK_NOT_FOUND", response.ErrorMessage);
    }

    [Fact]
    public async Task AddDrink_WhenImageTypeInvalid_ReturnsBadRequest()
    {
        var imageStream = new MemoryStream([1, 2, 3]);
        IFormFile image = new FormFile(imageStream, 0, imageStream.Length, "image", "image.gif")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/gif"
        };

        var request = new AddNewDrinkRequest
        {
            Name = "Tea",
            Image = image,
            Rating = 8,
            IsHealthyOption = true,
            Cost = 1,
            Difficulty = 1,
            Speed = 2,
            Ingredients = ["Water"]
        };

        var response = await _controller.AddDrink(request);

        Assert.Equal(HttpStatusCode.BadRequest, ControllerTestHelpers.GetStatusCode(response));
        Assert.Equal("BAD_REQUEST", response.ErrorMessage);
    }

    [Fact]
    public async Task GetAllDrinks_WhenServiceThrows_ReturnsInternalServerError()
    {
        _drinkService.GetAllDrinks(Arg.Any<DrinkFilterParams>())
            .Returns(Task.FromException<List<Drink>>(new Exception("boom")));

        var response = await _controller.GetAllDrinks(search: "latte");

        Assert.Equal(HttpStatusCode.InternalServerError, ControllerTestHelpers.GetStatusCode(response));
    }
}
