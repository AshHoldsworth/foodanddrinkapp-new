using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FoodAndDrinkApi.Requests;
using FoodAndDrinkApi.Responses;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodAndDrinkApi.Controllers;

[ApiController]
[Route("shopping-list")]
[Authorize]
public class ShoppingListController : Controller
{
    private readonly IShoppingListService _shoppingListService;
    private readonly ILogger<ShoppingListController> _logger;

    public ShoppingListController(IShoppingListService shoppingListService, ILogger<ShoppingListController> logger)
    {
        _shoppingListService = shoppingListService;
        _logger = logger;
    }

    [HttpGet]
    [Route("current")]
    public async Task<BaseApiResponse> GetCurrent()
    {
        var groupId = GetCurrentGroupId();
        if (string.IsNullOrWhiteSpace(groupId))
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.Forbidden, "No user group assigned. Please contact an admin.");
        }

        try
        {
            var shoppingList = await _shoppingListService.GetCurrentShoppingList(groupId);
            return ApiResponse<ShoppingList?>.SuccessResult(shoppingList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.InternalServerError, "Failed to load shopping list.");
        }
    }

    [HttpGet]
    [Route("completed")]
    public async Task<BaseApiResponse> GetCompleted([FromQuery] int limit = 20)
    {
        var groupId = GetCurrentGroupId();
        if (string.IsNullOrWhiteSpace(groupId))
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.Forbidden, "No user group assigned. Please contact an admin.");
        }

        try
        {
            var shoppingLists = await _shoppingListService.GetCompletedShoppingLists(groupId, limit);
            return ApiResponse<List<ShoppingList>>.SuccessResult(shoppingLists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.InternalServerError, "Failed to load completed shopping lists.");
        }
    }

    [HttpPost]
    [Route("generate")]
    public async Task<BaseApiResponse> Generate([FromBody] GenerateShoppingListRequest request)
    {
        var groupId = GetCurrentGroupId();
        if (string.IsNullOrWhiteSpace(groupId))
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.Forbidden, "No user group assigned. Please contact an admin.");
        }

        try
        {
            var shoppingList = await _shoppingListService.GenerateShoppingList(GetCurrentUserId(), groupId, request.DaysAhead);
            return ApiResponse<ShoppingList>.SuccessResult(shoppingList);
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.InternalServerError, "Failed to generate shopping list.");
        }
    }

    [HttpPost]
    [Route("item/purchase")]
    public async Task<BaseApiResponse> SetItemPurchased([FromBody] SetShoppingListItemPurchasedRequest request)
    {
        var groupId = GetCurrentGroupId();
        if (string.IsNullOrWhiteSpace(groupId))
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.Forbidden, "No user group assigned. Please contact an admin.");
        }

        try
        {
            var shoppingList = await _shoppingListService.SetItemPurchased(
                GetCurrentUserId(),
                groupId,
                request.ShoppingListId,
                request.IngredientId,
                request.IsPurchased);

            return ApiResponse<ShoppingList>.SuccessResult(shoppingList);
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.InternalServerError, "Failed to update shopping list item.");
        }
    }

    [HttpPost]
    [Route("complete")]
    public async Task<BaseApiResponse> Complete([FromBody] CompleteShoppingListRequest request)
    {
        var groupId = GetCurrentGroupId();
        if (string.IsNullOrWhiteSpace(groupId))
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.Forbidden, "No user group assigned. Please contact an admin.");
        }

        try
        {
            var shoppingList = await _shoppingListService.CompleteShoppingList(
                GetCurrentUserId(),
                GetCurrentUsername(),
                groupId,
                request.ShoppingListId);
            return ApiResponse<ShoppingList>.SuccessResult(shoppingList);
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.InternalServerError, "Failed to complete shopping list.");
        }
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
    }

    private string GetCurrentUsername()
    {
        return User.FindFirstValue("name") ?? "Unknown user";
    }

    private string? GetCurrentGroupId()
    {
        return User.FindFirstValue("groupId");
    }
}
