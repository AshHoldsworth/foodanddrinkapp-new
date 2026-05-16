using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkRepository.Data;
using FoodAndDrinkRepository.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodAndDrinkRepository.Repositories;

public interface IMealRepository
{
    Task<Meal> GetMealById(string id);
    Task<List<Meal>> GetAllMeal(MealFilterParams filter);
    Task<HashSet<string>> GetExistingMealIds(IEnumerable<string> ids);
    Task<List<Meal>> GetMealsByIds(IEnumerable<string> ids);
    Task AddMeal(Meal meal);
    Task UpdateMeal(Meal meal);
    Task DeleteMeal(string id);
}

public class MealRepository : IMealRepository
{
    private readonly AppDbContext _db;

    public MealRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Meal> GetMealById(string id)
    {
        if (!Guid.TryParse(id, out var guid)) throw new MealNotFoundException(id);

        var entity = await _db.Meals
            .Include(m => m.Ingredients)
                .ThenInclude(mi => mi.Ingredient)
            .FirstOrDefaultAsync(m => m.Id == guid);

        if (entity == null) throw new MealNotFoundException(id);

        return ToModel(entity);
    }

    public async Task<List<Meal>> GetAllMeal(MealFilterParams filter)
    {
        var query = _db.Meals
            .Include(m => m.Ingredients)
                .ThenInclude(mi => mi.Ingredient)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(m => EF.Functions.ILike(m.Name, $"%{filter.Search}%"));

        if (filter.IsHealthy == true)
            query = query.Where(m => m.IsHealthyOption);

        if (filter.NewOrUpdated == true)
        {
            var since = DateTime.UtcNow.AddDays(-7);
            query = query.Where(m => m.CreatedAt >= since || m.UpdatedAt >= since);
        }

        var entities = await query.ToListAsync();
        return entities.Select(ToModel).ToList();
    }

    public async Task<HashSet<string>> GetExistingMealIds(IEnumerable<string> ids)
    {
        var guids = ids
            .Where(id => Guid.TryParse(id, out _))
            .Select(Guid.Parse)
            .Distinct()
            .ToList();

        if (guids.Count == 0) return [];

        var found = await _db.Meals
            .Where(m => guids.Contains(m.Id))
            .Select(m => m.Id.ToString())
            .ToListAsync();

        return found.ToHashSet();
    }

    public async Task<List<Meal>> GetMealsByIds(IEnumerable<string> ids)
    {
        var guids = ids
            .Where(id => Guid.TryParse(id, out _))
            .Select(Guid.Parse)
            .Distinct()
            .ToList();

        if (guids.Count == 0) return [];

        var entities = await _db.Meals
            .Include(m => m.Ingredients)
                .ThenInclude(mi => mi.Ingredient)
            .Where(m => guids.Contains(m.Id))
            .ToListAsync();

        return entities.Select(ToModel).ToList();
    }

    public async Task AddMeal(Meal meal)
    {
        var exists = await _db.Meals.AnyAsync(m => m.Name == meal.Name);
        if (exists) throw new MealAlreadyExistsException(meal.Name);

        var entity = ToEntity(meal);
        _db.Meals.Add(entity);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateMeal(Meal meal)
    {
        if (!Guid.TryParse(meal.Id, out var guid)) throw new MealNotFoundException(meal.Id);

        var entity = await _db.Meals
            .Include(m => m.Ingredients)
            .FirstOrDefaultAsync(m => m.Id == guid);

        if (entity == null) throw new MealNotFoundException(meal.Id);

        entity.Name = meal.Name;
        entity.IsHealthyOption = meal.IsHealthyOption;
        entity.Course = meal.Course;
        entity.ImagePath = meal.ImagePath;
        entity.UpdatedBy = meal.UpdatedBy;
        entity.UpdatedAt = meal.UpdatedAt;

        // Replace ingredients
        entity.Ingredients.Clear();
        foreach (var mi in meal.Ingredients)
        {
            if (!Guid.TryParse(mi.IngredientId, out var ingGuid)) continue;
            entity.Ingredients.Add(new MealIngredientEntity
            {
                MealId = guid,
                IngredientId = ingGuid,
                Preparation = mi.Preparation,
                Quantity = mi.Quantity,
                UoM = string.IsNullOrWhiteSpace(mi.UoM) ? "Portions" : mi.UoM,
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task DeleteMeal(string id)
    {
        if (!Guid.TryParse(id, out var guid)) throw new MealNotFoundException(id);

        var entity = await _db.Meals.FindAsync(guid);
        if (entity == null) throw new MealNotFoundException(id);

        _db.Meals.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private static Meal ToModel(MealEntity entity)
    {
        var ingredients = entity.Ingredients
            .Select(mi => new MealIngredient(
                IngredientId: mi.IngredientId.ToString(),
                Name: mi.Ingredient?.Name ?? string.Empty,
                Macro: mi.Ingredient?.Macro,
                Preparation: mi.Preparation,
                Quantity: mi.Quantity,
                UoM: string.IsNullOrWhiteSpace(mi.UoM) ? "Portions" : mi.UoM))
            .ToList();

        return new Meal(
            id: entity.Id.ToString(),
            name: entity.Name,
            isHealthyOption: entity.IsHealthyOption,
            ingredients: ingredients,
            course: entity.Course,
            createdAt: entity.CreatedAt,
            updatedAt: entity.UpdatedAt,
            imagePath: entity.ImagePath,
            createdBy: entity.CreatedBy,
            updatedBy: entity.UpdatedBy);
    }

    private static MealEntity ToEntity(Meal meal)
    {
        var id = Guid.TryParse(meal.Id, out var guid) ? guid : Guid.NewGuid();

        var entity = new MealEntity
        {
            Id = id,
            Name = meal.Name,
            IsHealthyOption = meal.IsHealthyOption,
            Course = meal.Course,
            ImagePath = meal.ImagePath,
            CreatedBy = meal.CreatedBy,
            CreatedAt = meal.CreatedAt,
            UpdatedBy = meal.UpdatedBy,
            UpdatedAt = meal.UpdatedAt,
        };

        foreach (var mi in meal.Ingredients)
        {
            if (!Guid.TryParse(mi.IngredientId, out var ingGuid)) continue;
            entity.Ingredients.Add(new MealIngredientEntity
            {
                MealId = id,
                IngredientId = ingGuid,
                Preparation = mi.Preparation,
                Quantity = mi.Quantity,
                UoM = string.IsNullOrWhiteSpace(mi.UoM) ? "Portions" : mi.UoM,
            });
        }

        return entity;
    }
}

