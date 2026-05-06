using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkRepository.Data;
using FoodAndDrinkRepository.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodAndDrinkRepository.Repositories;

public interface IIngredientRepository
{
    Task<Ingredient> GetIngredientById(string id);
    Task<List<Ingredient>> GetAllIngredients(IngredientFilterParams filter);
    Task AddIngredient(Ingredient ingredient);
    Task UpdateIngredient(IngredientUpdateDetails update);
    Task DeleteIngredient(string id);
    Task<List<Ingredient>> GetIngredientsListByIds(List<string> ids);
}

public class IngredientRepository : IIngredientRepository
{
    private readonly AppDbContext _db;

    public IngredientRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Ingredient> GetIngredientById(string id)
    {
        if (!Guid.TryParse(id, out var guid)) throw new IngredientNotFoundException(id);

        var entity = await _db.Ingredients.FindAsync(guid);
        if (entity == null) throw new IngredientNotFoundException(id);

        return ToModel(entity);
    }

    public async Task<List<Ingredient>> GetAllIngredients(IngredientFilterParams filter)
    {
        var query = _db.Ingredients.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(i => EF.Functions.ILike(i.Name, $"%{filter.Search}%"));

        if (filter.IsHealthy == true)
            query = query.Where(i => i.IsHealthyOption);

        if (filter.MaxCost.HasValue)
            query = query.Where(i => i.Cost <= filter.MaxCost.Value);

        if (filter.MaxRating.HasValue)
            query = query.Where(i => i.Rating <= filter.MaxRating.Value);

        if (!string.IsNullOrWhiteSpace(filter.Macro))
            query = query.Where(i => i.Macro == filter.Macro);

        var entities = await query.ToListAsync();
        return entities.Select(ToModel).ToList();
    }

    public async Task AddIngredient(Ingredient ingredient)
    {
        var exists = await _db.Ingredients.AnyAsync(i => i.Name == ingredient.Name);
        if (exists) throw new IngredientAlreadyExistsException(ingredient.Name);

        _db.Ingredients.Add(ToEntity(ingredient));
        await _db.SaveChangesAsync();
    }

    public async Task UpdateIngredient(IngredientUpdateDetails update)
    {
        if (!Guid.TryParse(update.Id, out var guid)) throw new IngredientNotFoundException(update.Id);

        var entity = await _db.Ingredients.FindAsync(guid);
        if (entity == null) throw new IngredientNotFoundException(update.Id);

        if (update.Name != null) entity.Name = update.Name;
        if (update.Rating != null) entity.Rating = update.Rating.Value;
        if (update.IsHealthyOption != null) entity.IsHealthyOption = update.IsHealthyOption.Value;
        if (update.Cost != null) entity.Cost = update.Cost.Value;
        if (update.Macro != null) entity.Macro = update.Macro;
        if (update.Barcodes != null) entity.Barcodes = update.Barcodes.ToArray();
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task DeleteIngredient(string id)
    {
        if (!Guid.TryParse(id, out var guid)) throw new IngredientNotFoundException(id);

        var entity = await _db.Ingredients.FindAsync(guid);
        if (entity == null) throw new IngredientNotFoundException(id);

        _db.Ingredients.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<List<Ingredient>> GetIngredientsListByIds(List<string> ids)
    {
        var guids = ids
            .Where(id => Guid.TryParse(id, out _))
            .Select(Guid.Parse)
            .ToList();

        var entities = await _db.Ingredients
            .Where(i => guids.Contains(i.Id))
            .ToListAsync();

        if (entities.Count == 0) throw new IngredientNotFoundException(ids.FirstOrDefault() ?? "unknown");
        if (entities.Count != ids.Count) throw new NoIngredientsFoundException();

        return entities.Select(ToModel).ToList();
    }

    private static Ingredient ToModel(IngredientEntity entity, int stockQuantity = 0)
    {
        return new Ingredient(
            id: entity.Id.ToString(),
            name: entity.Name,
            rating: entity.Rating,
            isHealthyOption: entity.IsHealthyOption,
            cost: entity.Cost,
            macro: entity.Macro,
            barcodes: entity.Barcodes?.ToList(),
            createdAt: entity.CreatedAt,
            updatedAt: entity.UpdatedAt,
            stockQuantity: stockQuantity,
            createdBy: entity.CreatedBy,
            updatedBy: entity.UpdatedBy);
    }

    private static IngredientEntity ToEntity(Ingredient ingredient)
    {
        var id = Guid.TryParse(ingredient.Id, out var guid) ? guid : Guid.NewGuid();
        return new IngredientEntity
        {
            Id = id,
            Name = ingredient.Name,
            IsHealthyOption = ingredient.IsHealthyOption,
            Cost = ingredient.Cost,
            Rating = ingredient.Rating,
            Macro = ingredient.Macro,
            Barcodes = ingredient.Barcodes?.ToArray(),
            CreatedBy = ingredient.CreatedBy,
            CreatedAt = ingredient.CreatedAt,
            UpdatedBy = ingredient.UpdatedBy,
            UpdatedAt = ingredient.UpdatedAt,
        };
    }
}
