using FoodAndDrinkApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace FoodAndDrinkApi.Tests.Controllers;

public class DrinkControllerTests
{
    private readonly DrinkController _controller = new();

    [Fact]
    public void DrinkEndpoints_ReturnGone()
    {
        var result = _controller.DrinkEndpointsGone() as ObjectResult;
        Assert.NotNull(result);
        Assert.Equal(410, result.StatusCode);
    }
}
