using System.Net;
using FoodAndDrinkApi.Controllers;
using FoodAndDrinkApi.Requests;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace FoodAndDrinkApi.Tests.Controllers;

public class FoodControllerTests
{
    private readonly IFoodService _foodService;
    private readonly FoodController _controller;

    public FoodControllerTests()
    {
        _foodService = Substitute.For<IFoodService>();
        var logger = Substitute.For<ILogger<FoodController>>();
        _controller = new FoodController(_foodService, logger);
    }

    [Fact]
    public async Task GetFoodById_WhenFoodExists_ReturnsOk()
    {
        var food = new Food(
            id: "food-1",
            name: "Pasta",
            rating: 8,
            isHealthyOption: true,
            cost: 2,
            ingredients: ["Tomato"],
            course: "Dinner",
            difficulty: 2,
            speed: 2,
            createdAt: DateTime.UtcNow);

        _foodService.GetFoodById("food-1").Returns(Task.FromResult(food));

        var response = await _controller.GetFoodById("food-1");

        Assert.Equal(HttpStatusCode.OK, ControllerTestHelpers.GetStatusCode(response));
        Assert.Null(response.ErrorMessage);
    }

    [Fact]
    public async Task GetFoodById_WhenFoodMissing_ReturnsNotFound()
    {
        _foodService.GetFoodById("missing-id")
            .Returns(Task.FromException<Food>(new FoodNotFoundException("missing-id")));

        var response = await _controller.GetFoodById("missing-id");

        Assert.Equal(HttpStatusCode.NotFound, ControllerTestHelpers.GetStatusCode(response));
        Assert.Equal("FOOD_NOT_FOUND", response.ErrorMessage);
    }

    [Fact]
    public async Task AddFood_WhenImageTypeIsInvalid_ReturnsBadRequest()
    {
        var imageStream = new MemoryStream([1, 2, 3]);
        IFormFile image = new FormFile(imageStream, 0, imageStream.Length, "image", "image.gif")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/gif"
        };

        var request = new AddNewFoodRequest
        {
            Name = "Burger",
            Image = image,
            Rating = 8,
            IsHealthyOption = false,
            Cost = 2,
            Ingredients = ["Beef"],
            Course = "Dinner",
            Difficulty = 2,
            Speed = 2
        };

        var response = await _controller.AddFood(request);

        Assert.Equal(HttpStatusCode.BadRequest, ControllerTestHelpers.GetStatusCode(response));
        Assert.Equal("BAD_REQUEST", response.ErrorMessage);
    }
}
