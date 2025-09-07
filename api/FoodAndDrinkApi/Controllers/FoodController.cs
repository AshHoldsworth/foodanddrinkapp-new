using FoodAndDrinkApi.Requests;
using FoodAndDrinkApi.Responses;
using FoodAndDrinkApi.Responses.Constants;
using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace FoodAndDrinkApi.Controllers;

[ApiController]
[Route("food")]
public class FoodController : Controller
{
    private readonly IFoodService _foodService;
    private readonly ILogger<FoodController> _logger;
    
    public FoodController(IFoodService foodService, ILogger<FoodController> logger)
    {
            _foodService = foodService;
            _logger = logger;
    }
    
    [HttpGet]
    [Route("")]
    public async Task<BaseApiResponse> GetFoodById(string id)
    {
        try
        {
            var result = await _foodService.GetFoodById(id);
            return ApiResponse<Food>.SuccessResult(result);
        }
        catch (FoodNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult(FoodFailure.NotFound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult();
        }
        
    }
    
    [HttpGet]
    [Route("all")]
    public async Task<BaseApiResponse> GetAllFood()
    {
        try
        {
            var result = await _foodService.GetAllFood();

            return ApiResponse<List<Food>>.SuccessResult(result);
        }
        catch (NoFoodsFoundException ex)
        {
           _logger.LogError(ex, ex.Message);
           return FoodResponse.FailureResult(FoodFailure.NotFound);
        }
    }

    [HttpPost]
    [Route("add")]
    public async Task<BaseApiResponse> AddFood([FromBody]AddNewFoodRequest request)
    {
        var food = new Food(
            id: ObjectId.GenerateNewId().ToString(),
            name: request.Name,
            rating: request.Rating,
            isHealthyOption: request.IsHealthyOption,
            cost: request.Cost,
            course: request.Course,
            difficulty: request.Difficulty,
            speed: request.Speed,
            ingredients: request.Ingredients);

        try
        {
            await _foodService.AddFood(food);
        }
        catch (FoodAlreadyExistsException ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult(FoodFailure.AlreadyExists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult();
        }
        
        return ApiResponse<Food>.SuccessResult(food);
    }

    [HttpPost]
    [Route("update")]
    public async Task<BaseApiResponse> UpdateFood([FromBody] FoodUpdateRequest request)
    {
        var update = new FoodUpdateDetails()
        {
            Id = request.Id,
            Name = request.Name ?? null,
            Rating = request.Rating ?? null,
            IsHealthyOption = request.IsHealthyOption ?? null,
            Cost = request.Cost ?? null,
            Course = request.Course ?? null,
            Difficulty = request.Difficulty ?? null,
            Speed = request.Speed ?? null,
            Ingredients = request.Ingredients ?? null,
        };

        try
        {
            await _foodService.UpdateFood(update);
        }
        catch (FoodNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult(FoodFailure.NotFound);
        }
        catch (FoodNoUpdatesDetectedException ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult(FoodFailure.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult();
        }
        
        return BaseApiResponse.SuccessResult();
    }

    [HttpDelete]
    public async Task<BaseApiResponse> DeleteFood([FromQuery] string id)
    {
        try
        {
            await _foodService.DeleteFood(id);
            return BaseApiResponse.SuccessResult();
        }
        catch (FoodNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult(FoodFailure.NotFound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult();
        }
    }
}
