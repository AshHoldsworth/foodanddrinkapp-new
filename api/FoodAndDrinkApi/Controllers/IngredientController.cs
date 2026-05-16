using FoodAndDrinkApi.Requests;
using FoodAndDrinkApi.Responses;
using FoodAndDrinkApi.Responses.Constants;
using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace FoodAndDrinkApi.Controllers;

[ApiController]
[Route("ingredient")]
[Authorize]
public class IngredientController : Controller
{
    private readonly IIngredientService _ingredientService;
    private readonly ILogger<IngredientController> _logger;

    public IngredientController(IIngredientService ingredientService, ILogger<IngredientController> logger)
    {
        _ingredientService = ingredientService;
        _logger = logger;
    }

    [HttpPost]
    [Route("add")]
    public async Task<BaseApiResponse> AddIngredient([FromForm] AddNewIngredientRequest request)
    {
        var currentUsername = GetCurrentUsername();
        var ingredient = new Ingredient(
            id: Guid.NewGuid().ToString(),
            name: request.Name,
            isHealthyOption: request.IsHealthyOption,
            macro: request.Macro,
            barcodes: request.Barcodes,
            createdAt: request.CreatedAt,
            updatedAt: request.UpdatedAt,
            stockQuantity: 0,
            uoM: request.UoM,
            createdBy: currentUsername,
            updatedBy: currentUsername);

        try
        {
            await _ingredientService.AddIngredient(ingredient);
        }
        catch (IngredientAlreadyExistsException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.AlreadyExists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult();
        }

        return BaseApiResponse.SuccessResult();
    }

    [HttpPost]
    [Route("update")]
    public async Task<BaseApiResponse> UpdateIngredient([FromForm] IngredientUpdateRequest request)
    {
        var update = new IngredientUpdateDetails
        {
            Id = request.Id,
            Name = request.Name ?? null,
            IsHealthyOption = request.IsHealthyOption ?? null,
            Macro = request.Macro ?? null,
            UoM = request.UoM,
            StockQuantity = request.StockQuantity ?? null,
            Barcodes = request.Barcodes ?? null,
            UpdatedBy = GetCurrentUsername(),
        };

        try
        {
            await _ingredientService.UpdateIngredient(update, GetCurrentGroupId());
        }
        catch (IngredientNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.NotFound);
        }
        catch (IngredientNoUpdatesDetectedException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.NoUpdatesDetected);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult();
        }

        return BaseApiResponse.SuccessResult();
    }

    [HttpPost]
    [Route("update-stock-batch")]
    public async Task<BaseApiResponse> UpdateIngredientStockBatch([FromBody] UpdateIngredientStockBatchRequest request)
    {
        var groupId = GetCurrentGroupId();
        if (string.IsNullOrWhiteSpace(groupId))
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.Forbidden, "No user group assigned. Please contact an admin.");
        }

        var updates = request.Items
            .Select(item => new IngredientUpdateDetails
            {
                Id = item.Id,
                StockQuantity = item.StockQuantity,
                StockUoM = item.UoM,
                UpdatedBy = GetCurrentUsername(),
            })
            .ToList();

        try
        {
            await _ingredientService.UpdateIngredientStocks(updates, groupId);
        }
        catch (IngredientNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.NotFound);
        }
        catch (IngredientNoUpdatesDetectedException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.NoUpdatesDetected);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult();
        }

        return BaseApiResponse.SuccessResult();
    }

    [HttpGet]
    [Route("all")]
    public async Task<BaseApiResponse> GetAllIngredients(
        [FromQuery] string? search = null,
        [FromQuery] bool? isHealthy = null,
        [FromQuery] string? macro = null,
        [FromQuery] bool? inStockOnly = null)
    {
        var filter = new IngredientFilterParams
        {
            Search = search,
            IsHealthy = isHealthy,
            Macro = macro,
            InStockOnly = inStockOnly,
        };

        try
        {
            var data = await _ingredientService.GetAllIngredients(filter, GetCurrentGroupId());
            return ApiResponse<List<Ingredient>>.SuccessResult(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult();
        }

    }

    [HttpGet]
    [Route("list")]
    public async Task<BaseApiResponse> GetIngredientList([FromBody] IngredientListRequest request)
    {
        try
        {
            var data = await _ingredientService.GetIngredientsListByIds(request.IngredientIds);
            return ApiResponse<List<Ingredient>>.SuccessResult(data);
        }
        catch (NoIngredientsFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.NotFound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult();
        }
    }

    [HttpGet]
    [Route("")]
    public async Task<BaseApiResponse> GetAllIngredients([FromQuery] string id)
    {
        try
        {
            var data = await _ingredientService.GetIngredientById(id, GetCurrentGroupId());
            return ApiResponse<Ingredient>.SuccessResult(data);
        }
        catch (IngredientNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.NotFound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult();
        }
    }

    [HttpDelete]
    [Route("delete")]
    public async Task<BaseApiResponse> DeleteIngredient([FromQuery] string id)
    {
        try
        {
            await _ingredientService.DeleteIngredient(id);
            return BaseApiResponse.SuccessResult();
        }
        catch (IngredientNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.NotFound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult();
        }
    }

    private string? GetCurrentGroupId()
    {
        return User?.FindFirstValue("groupId");
    }

    private string GetCurrentUserId()
    {
        return User?.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
    }

    private string GetCurrentUsername()
    {
        return User?.FindFirstValue("name") ?? GetCurrentUserId();
    }
}
