using FoodAndDrinkApi.Requests;
using FoodAndDrinkApi.Responses;
using FoodAndDrinkApi.Responses.Constants;
using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Mvc;

namespace FoodAndDrinkApi.Controllers;

[ApiController]
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
    [Route("ingredient/add")]
    internal async Task<BaseApiResponse> AddIngredient([FromForm]AddNewIngredientRequest request)
    {
        var ingredient = new Ingredient(
            id: Guid.NewGuid().ToString(),
            name: request.Name,
            rating: request.Rating,
            isHealthyOption: request.IsHealthyOption,
            cost: request.Cost,
            macro: request.Macro,
            barcodes: request.Barcodes);

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
    [Route("ingredient/update")]
    internal async Task<BaseApiResponse> UpdateIngredient([FromForm]IngredientUpdateRequest request)
    {
        var update = new IngredientUpdateDetails
        {
            Id = request.Id,
            Name = request.Name ?? null,
            Rating = request.Rating ?? null,
            IsHealthyOption = request.IsHealthyOption ?? null,
            Cost = request.Cost ?? null,
            Macro = request.Macro ?? null,
            Barcodes = request.Barcodes ?? null,
        };

        try
        {
            await _ingredientService.UpdateIngredient(update);
        }
        catch (IngredientNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.NotFound);
        }
        catch (IngredientNoUpdatesDetectedException ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult(IngredientFailure.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return IngredientResponse.FailureResult();
        }
        
        return BaseApiResponse.SuccessResult();
    }

    [HttpGet]
    [Route("ingredient/all")]
    internal async Task<BaseApiResponse> GetAllIngredients()
    {
        var data = await _ingredientService.GetAllIngredients();
        
        return ApiResponse<List<Ingredient>>.SuccessResult(data);
    }
    
    [HttpGet]
    [Route("ingredient/{id}")]
    internal async Task<BaseApiResponse> GetAllIngredients([FromQuery] string id)
    {
        try
        {
            var data = await _ingredientService.GetIngredientById(id);
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
}