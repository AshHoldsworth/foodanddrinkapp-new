using System.Net;
using System.Security.Claims;
using FoodAndDrinkApi.Requests;
using FoodAndDrinkApi.Responses;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodAndDrinkApi.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpGet]
    [Route("me")]
    [Authorize]
    public BaseApiResponse Me()
    {
        var id = GetCurrentUserId();
        var username = User.FindFirstValue("name") ?? string.Empty;
        var role = User.FindFirstValue("role") ?? "user";
        var groupId = User.FindFirstValue("groupId");

        return ApiResponse<object>.SuccessResult(new { id, username, role, groupId });
    }

    [HttpGet]
    [Route("users")]
    [Authorize(Roles = "admin")]
    public async Task<BaseApiResponse> GetUsers()
    {
        try
        {
            var users = await _authService.GetAllUsers();
            return ApiResponse<List<UserSummaryResponse>>.SuccessResult(users.Select(ToSummary).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(HttpStatusCode.InternalServerError, "Failed to fetch users.");
        }
    }

    [HttpGet]
    [Route("user-groups")]
    [Authorize(Roles = "admin")]
    public async Task<BaseApiResponse> GetUserGroups()
    {
        try
        {
            var groups = await _authService.GetAllUserGroups();
            return ApiResponse<List<UserGroupResponse>>.SuccessResult(groups.Select(ToGroupResponse).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(HttpStatusCode.InternalServerError, "Failed to fetch user groups.");
        }
    }

    [HttpPost]
    [Route("user-groups")]
    [Authorize(Roles = "admin")]
    public async Task<BaseApiResponse> CreateUserGroup([FromBody] CreateUserGroupRequest request)
    {
        try
        {
            var group = await _authService.CreateUserGroup(request.Name, GetCurrentUsername());
            return ApiResponse<UserGroupResponse>.SuccessResult(ToGroupResponse(group));
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(HttpStatusCode.InternalServerError, "Failed to create user group.");
        }
    }

    [HttpPut]
    [Route("users/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<BaseApiResponse> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        if (GetCurrentUserId() == id)
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.Forbidden, "Admins cannot edit their own account from the admin screen.");
        }

        try
        {
            var user = await _authService.UpdateUser(id, request.Username, request.Role, request.GroupId);
            return ApiResponse<UserSummaryResponse>.SuccessResult(ToSummary(user));
        }
        catch (UserNotFoundException ex)
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.NotFound, ex.Message);
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(HttpStatusCode.InternalServerError, "Failed to update user.");
        }
    }

    [HttpDelete]
    [Route("users/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<BaseApiResponse> DeleteUser(string id)
    {
        if (GetCurrentUserId() == id)
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.Forbidden, "Admins cannot delete their own account from the admin screen.");
        }

        try
        {
            await _authService.DeleteUser(id);
            return BaseApiResponse.SuccessResult();
        }
        catch (UserNotFoundException ex)
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.NotFound, ex.Message);
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(HttpStatusCode.InternalServerError, "Failed to delete user.");
        }
    }

    private static UserSummaryResponse ToSummary(User user)
    {
        return new UserSummaryResponse
        {
            Id = user.Id,
            Username = user.Username,
            Role = user.Role,
            GroupId = user.GroupId,
            GroupName = user.GroupName,
            CreatedAt = user.CreatedAt,
        };
    }

    private static UserGroupResponse ToGroupResponse(UserGroup group)
    {
        return new UserGroupResponse
        {
            Id = group.Id,
            Name = group.Name,
            CreatedAt = group.CreatedAt,
        };
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue("sub") ?? string.Empty;
    }

    private string GetCurrentUsername()
    {
        return User.FindFirstValue("name") ?? string.Empty;
    }
}
