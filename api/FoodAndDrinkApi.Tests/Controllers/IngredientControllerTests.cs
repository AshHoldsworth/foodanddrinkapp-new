using System.Net;
using FoodAndDrinkApi.Controllers;
using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace FoodAndDrinkApi.Tests.Controllers;

public class IngredientControllerTests
{
    private readonly IIngredientService _ingredientService;
    private readonly IngredientController _controller;

    public IngredientControllerTests()
    {
        _ingredientService = Substitute.For<IIngredientService>();
        var logger = Substitute.For<ILogger<IngredientController>>();
        _controller = new IngredientController(_ingredientService, logger);
    }

    [Fact]
    public async Task DeleteIngredient_WhenMissing_ReturnsNotFound()
    {
        _ingredientService.DeleteIngredient("missing-id")
            .Returns(Task.FromException(new IngredientNotFoundException("missing-id")));

        var response = await _controller.DeleteIngredient("missing-id");

        Assert.Equal(HttpStatusCode.NotFound, ControllerTestHelpers.GetStatusCode(response));
        Assert.Equal("INGREDIENT_NOT_FOUND", response.ErrorMessage);
    }

    [Fact]
    public async Task GetAllIngredients_WhenServiceThrows_ReturnsInternalServerError()
    {
        _ingredientService.GetAllIngredients(Arg.Any<IngredientFilterParams>(), Arg.Any<string?>())
            .Returns(Task.FromException<List<Ingredient>>(new Exception("Unexpected failure")));

        var response = await _controller.GetAllIngredients(search: "a", isHealthy: true, maxCost: 2, maxRating: 7);

        Assert.Equal(HttpStatusCode.InternalServerError, ControllerTestHelpers.GetStatusCode(response));
        Assert.Null(response.ErrorMessage);
    }
}
