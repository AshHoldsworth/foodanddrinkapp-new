using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodAndDrinkApi.Controllers;

/// <summary>
/// Drinks have been removed from this application.
/// All endpoints return 410 Gone.
/// </summary>
[ApiController]
[Route("drink")]
[Authorize]
public class DrinkController : ControllerBase
{
    [HttpGet("all")]
    [HttpGet("{id}")]
    [HttpPost("add")]
    [HttpPut("update")]
    [HttpDelete("{id}")]
    public IActionResult DrinkEndpointsGone() =>
        StatusCode(410, new { message = "Drinks are no longer supported by this application." });
}
