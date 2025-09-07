using FoodAndDrinkApi.Requests;
using FoodAndDrinkApi.Responses;
using FoodAndDrinkApi.Responses.Constants;
using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using System.Net;

namespace FoodAndDrinkApi.Controllers;

[ApiController]
[Route("ingredient")]
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
    public async Task<BaseApiResponse> AddIngredient([FromForm]AddNewIngredientRequest request)
    {
        var ingredient = new Ingredient(
            id: ObjectId.GenerateNewId().ToString(),
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
    [Route("update")]
    public async Task<BaseApiResponse> UpdateIngredient([FromForm]IngredientUpdateRequest request)
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
    [Route("all")]
    public async Task<BaseApiResponse> GetAllIngredients()
    {
        try
        {
            var data = await _ingredientService.GetAllIngredients();
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
}
