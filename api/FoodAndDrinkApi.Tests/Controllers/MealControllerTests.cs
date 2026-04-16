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

public class MealControllerTests
{
    private readonly IMealService _mealService;
    private readonly MealController _controller;

    public MealControllerTests()
    {
        _mealService = Substitute.For<IMealService>();
        var logger = Substitute.For<ILogger<MealController>>();
        _controller = new MealController(_mealService, logger);
    }

    [Fact]
    public async Task GetMealById_WhenMealExists_ReturnsOk()
    {
        var meal = new Meal(
            id: "meal-1",
            name: "Pasta",
            rating: 8,
            isHealthyOption: true,
            cost: 2,
            ingredients: [new MealIngredient("Tomato", "Carbs")],
            course: "Dinner",
            difficulty: 2,
            speed: 2,
            createdAt: DateTime.UtcNow);

        _mealService.GetMealById("meal-1").Returns(Task.FromResult(meal));

        var response = await _controller.GetMealById("meal-1");

        Assert.Equal(HttpStatusCode.OK, ControllerTestHelpers.GetStatusCode(response));
        Assert.Null(response.ErrorMessage);
    }

    [Fact]
    public async Task GetMealById_WhenMealMissing_ReturnsNotFound()
    {
        _mealService.GetMealById("missing-id")
            .Returns(Task.FromException<Meal>(new MealNotFoundException("missing-id")));

        var response = await _controller.GetMealById("missing-id");

        Assert.Equal(HttpStatusCode.NotFound, ControllerTestHelpers.GetStatusCode(response));
        Assert.Equal("MEAL_NOT_FOUND", response.ErrorMessage);
    }

    [Fact]
    public async Task AddMeal_WhenImageTypeIsInvalid_ReturnsBadRequest()
    {
        var imageStream = new MemoryStream([1, 2, 3]);
        IFormFile image = new FormFile(imageStream, 0, imageStream.Length, "image", "image.gif")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/gif"
        };

        var request = new AddNewMealRequest
        {
            Name = "Burger",
            Image = image,
            Rating = 8,
            IsHealthyOption = false,
            Cost = 2,
            Ingredients = [new MealIngredientRequest { Name = "Beef", Macro = "Protein" }],
            Course = "Dinner",
            Difficulty = 2,
            Speed = 2
        };

        var response = await _controller.AddMeal(request);

        Assert.Equal(HttpStatusCode.BadRequest, ControllerTestHelpers.GetStatusCode(response));
        Assert.Equal("BAD_REQUEST", response.ErrorMessage);
    }
}
