using System.Net;
using FoodAndDrinkApi.Controllers;
using FoodAndDrinkApi.Requests;
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
