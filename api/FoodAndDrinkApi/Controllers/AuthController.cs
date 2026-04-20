using System.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FoodAndDrinkApi.Requests;
using FoodAndDrinkApi.Responses;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace FoodAndDrinkApi.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private const string AuthCookieName = "fd_auth_token";
    private const int TokenExpirationHours = 8;

    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, IConfiguration configuration)
    {
        _authService = authService;
        _logger = logger;
        _configuration = configuration;
    }

    [HttpPost]
    [Route("login")]
    [AllowAnonymous]
    public async Task<BaseApiResponse> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.BadRequest, "Username and password are required.");
        }

        try
        {
            var user = await _authService.ValidateCredentials(request.Username, request.Password);

            if (user == null)
            {
                return ApiResponse<string>.FailureResult(HttpStatusCode.Unauthorized, "Invalid username or password.");
            }

            if (user.Role != "admin" && string.IsNullOrWhiteSpace(user.GroupId))
            {
                return ApiResponse<string>.FailureResult(HttpStatusCode.Forbidden, "No user group assigned. Please contact an admin.");
            }

            var token = BuildToken(user);

            Response.Cookies.Append(AuthCookieName, token, new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddHours(TokenExpirationHours),
                Path = "/",
            });

            return BaseApiResponse.SuccessResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(HttpStatusCode.InternalServerError, "Failed to login.");
        }
    }

    [HttpPost]
    [Route("logout")]
    [Authorize]
    public BaseApiResponse Logout()
    {
        Response.Cookies.Delete(AuthCookieName, new CookieOptions
        {
            Path = "/",
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps,
        });

        return BaseApiResponse.SuccessResult();
    }

    [HttpPost]
    [Route("register")]
    [AllowAnonymous]
    public async Task<BaseApiResponse> Register([FromBody] RegisterUserRequest request)
    {
        try
        {
            var hasAnyUsers = await _authService.HasAnyUsers();

            if (hasAnyUsers)
            {
                if (User?.Identity?.IsAuthenticated != true || !User.IsInRole("admin"))
                {
                    return ApiResponse<string>.FailureResult(HttpStatusCode.Forbidden, "Admin access required.");
                }
            }

            var role = hasAnyUsers ? request.Role : "admin";
            var user = await _authService.RegisterUser(request.Username, request.Password, role, request.GroupId);

            return ApiResponse<UserSummaryResponse>.SuccessResult(ToSummary(user));
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(HttpStatusCode.InternalServerError, "Failed to register user.");
        }
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
            var group = await _authService.CreateUserGroup(request.Name);
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

    [HttpPost]
    [Route("change-password")]
    [Authorize]
    public async Task<BaseApiResponse> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            await _authService.ChangePassword(
                GetCurrentUserId(),
                request.CurrentPassword,
                request.NewPassword);

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
            return ApiResponse<string>.FailureResult(HttpStatusCode.InternalServerError, "Failed to change password.");
        }
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

    private string BuildToken(User user)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new("name", user.Username),
            new("role", user.Role),
        };

        if (!string.IsNullOrWhiteSpace(user.GroupId))
        {
            claims.Add(new Claim("groupId", user.GroupId));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GetJwtSecret()));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(TokenExpirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GetJwtSecret()
    {
        return _configuration["JWT_SECRET"]
            ?? Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? "dev-jwt-secret-change-me-32chars!";
    }

    private static UserSummaryResponse ToSummary(User user)
    {
        return new UserSummaryResponse
        {
            Id = user.Id,
            Username = user.Username,
            Role = user.Role,
            GroupId = user.GroupId,
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
        return User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
    }
}
