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
    private static readonly HashSet<string> AllowedImageTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };
    private const long MaxImageSizeBytes = 5 * 1024 * 1024;

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
    public async Task<BaseApiResponse> GetAllFood(
        [FromQuery] string? search = null,
        [FromQuery] bool? isHealthy = null,
        [FromQuery] int? maxCost = null,
        [FromQuery] int? maxRating = null,
        [FromQuery] int? maxSpeed = null,
        [FromQuery] bool? newOrUpdated = null)
    {
        var filter = new FoodFilterParams
        {
            Search = search,
            IsHealthy = isHealthy,
            MaxCost = maxCost,
            MaxRating = maxRating,
            MaxSpeed = maxSpeed,
            NewOrUpdated = newOrUpdated,
        };

        try
        {
            var result = await _foodService.GetAllFood(filter);
            return ApiResponse<List<Food>>.SuccessResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult();
        }
    }

    [HttpPost]
    [Route("add")]
    public async Task<BaseApiResponse> AddFood([FromForm] AddNewFoodRequest request)
    {
        var foodId = ObjectId.GenerateNewId().ToString();
        string? imagePath;

        try
        {
            imagePath = await SaveFoodImageAsync(foodId, request.Image);
        }
        catch (ArgumentException ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult(FoodFailure.BadRequest);
        }

        var food = new Food(
            id: foodId,
            name: request.Name,
            rating: request.Rating,
            isHealthyOption: request.IsHealthyOption,
            cost: request.Cost,
            course: request.Course,
            difficulty: request.Difficulty,
            speed: request.Speed,
            ingredients: request.Ingredients,
            createdAt: DateTime.UtcNow,
            updatedAt: null,
            imagePath: imagePath);

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

    private async Task<string?> SaveFoodImageAsync(string foodId, IFormFile? image)
    {
        if (image == null || image.Length == 0) return null;

        if (image.Length > MaxImageSizeBytes)
            throw new ArgumentException("Image is too large.");

        if (!AllowedImageTypes.Contains(image.ContentType))
            throw new ArgumentException("Unsupported image format.");

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "food");
        Directory.CreateDirectory(uploadsRoot);

        var extension = Path.GetExtension(image.FileName);
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = image.ContentType switch
            {
                "image/jpeg" => ".jpg",
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ".jpg"
            };
        }

        var safeExtension = extension.ToLowerInvariant();
        var fileName = $"{foodId}{safeExtension}";
        var fullPath = Path.Combine(uploadsRoot, fileName);

        await using var stream = System.IO.File.Create(fullPath);
        await image.CopyToAsync(stream);

        return $"/media/food/{fileName}";
    }

    [HttpPost]
    [Route("update")]
    public async Task<BaseApiResponse> UpdateFood([FromForm] FoodUpdateRequest request)
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
            return FoodResponse.FailureResult(FoodFailure.NoUpdatesDetected);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return FoodResponse.FailureResult();
        }

        return BaseApiResponse.SuccessResult();
    }

    [HttpPost]
    [Route("delete")]
    public async Task<BaseApiResponse> DeleteFood([FromQuery] string id)
    {
        try
        {
            var food = await _foodService.GetFoodById(id);
            await _foodService.DeleteFood(id);
            DeleteImageFile(food.ImagePath);
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

    private static void DeleteImageFile(string? imagePath)
    {
        if (string.IsNullOrWhiteSpace(imagePath)) return;

        var relativePath = imagePath.Replace("/media/", "", StringComparison.OrdinalIgnoreCase);
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", relativePath.Replace('/', Path.DirectorySeparatorChar));

        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);
    }
}
