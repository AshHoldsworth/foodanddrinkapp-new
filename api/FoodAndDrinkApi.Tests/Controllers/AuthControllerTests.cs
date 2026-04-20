using System.Net;
using System.Security.Claims;
using FoodAndDrinkApi.Controllers;
using FoodAndDrinkApi.Requests;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace FoodAndDrinkApi.Tests.Controllers;

public class AuthControllerTests
{
    private readonly IAuthService _authService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authService = Substitute.For<IAuthService>();
        var logger = Substitute.For<ILogger<AuthController>>();
        var configuration = Substitute.For<IConfiguration>();
        _controller = new AuthController(_authService, logger, configuration)
        {
            ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
    }

    [Fact]
    public async Task UpdateUser_WhenAdminTargetsOwnAccount_ReturnsForbidden()
    {
        SetAuthenticatedUser("admin-1", "admin-user", "admin");

        var response = await _controller.UpdateUser("admin-1", new UpdateUserRequest
        {
            Username = "new-admin",
            Role = "admin"
        });

        Assert.Equal(HttpStatusCode.Forbidden, ControllerTestHelpers.GetStatusCode(response));
        await _authService.DidNotReceive().UpdateUser(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string?>());
    }

    [Fact]
    public async Task DeleteUser_WhenAdminTargetsOwnAccount_ReturnsForbidden()
    {
        SetAuthenticatedUser("admin-1", "admin-user", "admin");

        var response = await _controller.DeleteUser("admin-1");

        Assert.Equal(HttpStatusCode.Forbidden, ControllerTestHelpers.GetStatusCode(response));
        await _authService.DidNotReceive().DeleteUser(Arg.Any<string>());
    }

    [Fact]
    public async Task ChangePassword_WhenRequestIsValid_ReturnsOk()
    {
        SetAuthenticatedUser("user-1", "ash", "user");

        var response = await _controller.ChangePassword(new ChangePasswordRequest
        {
            CurrentPassword = "old-password",
            NewPassword = "new-password"
        });

        Assert.Equal(HttpStatusCode.OK, ControllerTestHelpers.GetStatusCode(response));
        await _authService.Received(1).ChangePassword("user-1", "old-password", "new-password");
    }

    [Fact]
    public void Me_ReturnsCurrentUserDetails()
    {
        SetAuthenticatedUser("user-1", "ash", "admin");

        var response = _controller.Me();

        Assert.Equal(HttpStatusCode.OK, ControllerTestHelpers.GetStatusCode(response));
        Assert.Null(response.ErrorMessage);
    }

    private void SetAuthenticatedUser(string id, string username, string role)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, id),
            new("sub", id),
            new("name", username),
            new("role", role),
            new(ClaimTypes.Role, role),
        };

        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(claims, "TestAuth"));
    }
}
