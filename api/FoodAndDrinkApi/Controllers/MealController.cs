using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FoodAndDrinkApi.Requests;
using FoodAndDrinkApi.Responses;
using FoodAndDrinkApi.Responses.Constants;
using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace FoodAndDrinkApi.Controllers;

[ApiController]
[Route("meal")]
[Authorize]
public class MealController : Controller
{
    private readonly IMealService _mealService;
    private readonly IMealPlanService _mealPlanService;
    private readonly ILogger<MealController> _logger;
    private static readonly HashSet<string> AllowedImageTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };
    private const long MaxImageSizeBytes = 5 * 1024 * 1024;

    public MealController(IMealService mealService, IMealPlanService mealPlanService, ILogger<MealController> logger)
    {
        _mealService = mealService;
        _mealPlanService = mealPlanService;
        _logger = logger;
    }

    [HttpGet]
    [Route("all")]
    public async Task<BaseApiResponse> GetAllMeal(
        [FromQuery] string? search = null,
        [FromQuery] bool? isHealthy = null,
        [FromQuery] int? maxCost = null,
        [FromQuery] int? maxRating = null,
        [FromQuery] int? maxSpeed = null,
        [FromQuery] bool? newOrUpdated = null)
    {
        var filter = new MealFilterParams
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
            var result = await _mealService.GetAllMeal(filter);
            return ApiResponse<List<Meal>>.SuccessResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult();
        }
    }

    [HttpGet]
    [Route("plan")]
    public async Task<BaseApiResponse> GetMealPlan([FromQuery] DateTime? weekStart = null)
    {
        try
        {
            var plan = await _mealPlanService.GetWeekPlan(GetCurrentUserId(), weekStart ?? DateTime.UtcNow);
            return ApiResponse<MealPlan>.SuccessResult(plan);
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult();
        }
    }

    [HttpPost]
    [Route("plan")]
    public async Task<BaseApiResponse> SaveMealPlan([FromBody] SaveMealPlanRequest request)
    {
        try
        {
            var plan = await _mealPlanService.SaveWeekPlan(
                GetCurrentUserId(),
                request.WeekStart,
                request.Days.Select(day => new MealPlanDay(day.Date, day.LunchMealId, day.DinnerMealId)).ToList());

            return ApiResponse<MealPlan>.SuccessResult(plan);
        }
        catch (ArgumentException ex)
        {
            return ApiResponse<string>.FailureResult(System.Net.HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult();
        }
    }

    [HttpPost]
    [Route("add")]
    public async Task<BaseApiResponse> AddMeal([FromForm] AddNewMealRequest request)
    {
        var mealId = ObjectId.GenerateNewId().ToString();
        string? imagePath;
        var ingredients = request.Ingredients
            .Select(ingredient => new MealIngredient(ingredient.Name, ingredient.Macro))
            .ToList();

        try
        {
            imagePath = await SaveMealImageAsync(mealId, request.Image);
        }
        catch (ArgumentException ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult(MealFailure.BadRequest);
        }

        var meal = new Meal(
            id: mealId,
            name: request.Name,
            rating: request.Rating,
            isHealthyOption: request.IsHealthyOption,
            cost: request.Cost,
            course: request.Course,
            difficulty: request.Difficulty,
            speed: request.Speed,
            ingredients: ingredients,
            createdAt: DateTime.UtcNow,
            updatedAt: null,
            imagePath: imagePath);

        try
        {
            await _mealService.AddMeal(meal);
        }
        catch (MealAlreadyExistsException ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult(MealFailure.AlreadyExists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult();
        }

        return ApiResponse<Meal>.SuccessResult(meal);
    }

    private async Task<string?> SaveMealImageAsync(string mealId, IFormFile? image)
    {
        if (image == null || image.Length == 0) return null;

        if (image.Length > MaxImageSizeBytes)
            throw new ArgumentException("Image is too large.");

        if (!AllowedImageTypes.Contains(image.ContentType))
            throw new ArgumentException("Unsupported image format.");

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "meal");
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
        var fileName = $"{mealId}{safeExtension}";
        var fullPath = Path.Combine(uploadsRoot, fileName);

        await using var stream = System.IO.File.Create(fullPath);
        await image.CopyToAsync(stream);

        return $"/media/meal/{fileName}";
    }

    [HttpPost]
    [Route("update")]
    public async Task<BaseApiResponse> UpdateMeal([FromForm] MealUpdateRequest request)
    {
        string? replacementImagePath = null;
        string? previousImagePath = null;

        try
        {
            if (request.Image != null)
            {
                var existingMeal = await _mealService.GetMealById(request.Id);
                previousImagePath = existingMeal.ImagePath;
                replacementImagePath = await SaveMealImageAsync(request.Id, request.Image);
            }
        }
        catch (MealNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult(MealFailure.NotFound);
        }
        catch (ArgumentException ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult(MealFailure.BadRequest);
        }

        var update = new MealUpdateDetails()
        {
            Id = request.Id,
            Name = request.Name ?? null,
            Rating = request.Rating ?? null,
            IsHealthyOption = request.IsHealthyOption ?? null,
            Cost = request.Cost ?? null,
            Course = request.Course ?? null,
            Difficulty = request.Difficulty ?? null,
            Speed = request.Speed ?? null,
            Ingredients = request.Ingredients?.Select(ingredient => new MealIngredient(ingredient.Name, ingredient.Macro)).ToList(),
            ImagePath = replacementImagePath,
        };

        try
        {
            await _mealService.UpdateMeal(update);

            if (replacementImagePath != null &&
                previousImagePath != null &&
                !string.Equals(previousImagePath, replacementImagePath, StringComparison.OrdinalIgnoreCase))
            {
                DeleteImageFile(previousImagePath);
            }
        }
        catch (MealNotFoundException ex)
        {
            DeleteImageFile(replacementImagePath);
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult(MealFailure.NotFound);
        }
        catch (MealNoUpdatesDetectedException ex)
        {
            DeleteImageFile(replacementImagePath);
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult(MealFailure.NoUpdatesDetected);
        }
        catch (Exception ex)
        {
            DeleteImageFile(replacementImagePath);
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult();
        }

        return BaseApiResponse.SuccessResult();
    }

    [HttpPost]
    [Route("delete")]
    public async Task<BaseApiResponse> DeleteMeal([FromQuery] string id)
    {
        try
        {
            var meal = await _mealService.GetMealById(id);
            await _mealService.DeleteMeal(id);
            DeleteImageFile(meal.ImagePath);
            return BaseApiResponse.SuccessResult();
        }
        catch (MealNotFoundException ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult(MealFailure.NotFound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return MealResponse.FailureResult();
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

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
    }
}
