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
[Route("drink")]
public class DrinkController : Controller
{
    private readonly IDrinkService _drinkService;
    private readonly ILogger<DrinkController> _logger;
    private static readonly HashSet<string> AllowedImageTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };
    private const long MaxImageSizeBytes = 5 * 1024 * 1024;

    public DrinkController(IDrinkService drinkService, ILogger<DrinkController> logger)
    {
        _drinkService = drinkService;
        _logger = logger;
    }

    [HttpGet]
    [Route("all")]
    public async Task<BaseApiResponse> GetAllDrinks(
        [FromQuery] string? search = null,
        [FromQuery] bool? isHealthy = null,
        [FromQuery] int? maxCost = null,
        [FromQuery] int? maxRating = null,
        [FromQuery] int? maxSpeed = null,
        [FromQuery] bool? newOrUpdated = null)
    {
        var filter = new DrinkFilterParams
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
            var result = await _drinkService.GetAllDrinks(filter);
            return ApiResponse<List<Drink>>.SuccessResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return DrinkResponse.FailureResult();
        }
    }

    [HttpGet]
    [Route("")]
    public async Task<BaseApiResponse> GetDrinkById(string id)
    {
        try
        {
            var result = await _drinkService.GetDrinkById(id);
            return ApiResponse<Drink>.SuccessResult(result);
        }
        catch (DrinkNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return DrinkResponse.FailureResult(DrinkFailure.NotFound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return DrinkResponse.FailureResult();
        }
    }

    [HttpPost]
    [Route("add")]
    public async Task<BaseApiResponse> AddDrink([FromForm] AddNewDrinkRequest request)
    {
        var drinkId = ObjectId.GenerateNewId().ToString();
        string? imagePath;

        try
        {
            imagePath = await SaveDrinkImageAsync(drinkId, request.Image);
        }
        catch (ArgumentException ex)
        {
            _logger.LogError(ex, ex.Message);
            return DrinkResponse.FailureResult(DrinkFailure.BadRequest);
        }

        var drink = new Drink(
            id: drinkId,
            name: request.Name,
            rating: request.Rating,
            isHealthyOption: request.IsHealthyOption,
            cost: request.Cost,
            ingredients: request.Ingredients,
            difficulty: request.Difficulty,
            speed: request.Speed,
            createdAt: DateTime.UtcNow,
            updatedAt: null,
            imagePath: imagePath
        );

        try
        {
            await _drinkService.AddDrink(drink);
        }
        catch (DrinkAlreadyExistsException ex)
        {
            _logger.LogError(ex, ex.Message);
            return DrinkResponse.FailureResult(DrinkFailure.AlreadyExists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return DrinkResponse.FailureResult();
        }

        return ApiResponse<Drink>.SuccessResult(drink);
    }

    [HttpPost]
    [Route("delete")]
    public async Task<BaseApiResponse> DeleteDrink([FromQuery] string id)
    {
        try
        {
            var drink = await _drinkService.GetDrinkById(id);
            await _drinkService.DeleteDrink(id);
            DeleteImageFile(drink.ImagePath);
            return BaseApiResponse.SuccessResult();
        }
        catch (DrinkNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return DrinkResponse.FailureResult(DrinkFailure.NotFound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return DrinkResponse.FailureResult();
        }
    }

    private async Task<string?> SaveDrinkImageAsync(string drinkId, IFormFile? image)
    {
        if (image == null || image.Length == 0) return null;

        if (image.Length > MaxImageSizeBytes)
            throw new ArgumentException("Image is too large.");

        if (!AllowedImageTypes.Contains(image.ContentType))
            throw new ArgumentException("Unsupported image format.");

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "drink");
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
        var fileName = $"{drinkId}{safeExtension}";
        var fullPath = Path.Combine(uploadsRoot, fileName);

        await using var stream = System.IO.File.Create(fullPath);
        await image.CopyToAsync(stream);

        return $"/media/drink/{fileName}";
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