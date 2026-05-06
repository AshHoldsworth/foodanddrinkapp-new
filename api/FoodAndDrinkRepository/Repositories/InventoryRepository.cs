using FoodAndDrinkRepository.Data;
using FoodAndDrinkRepository.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodAndDrinkRepository.Repositories;

public interface IInventoryRepository
{
    Task<Dictionary<string, int>> GetStockByIngredientIds(string groupId, List<string> ingredientIds);
    Task SetStockQuantity(string groupId, string groupName, string ingredientId, string ingredientName, int stockQuantity);
    Task IncrementStockQuantity(string groupId, string groupName, string ingredientId, string ingredientName, int amount);
    Task DeleteByIngredientId(string ingredientId);
}

public class InventoryRepository : IInventoryRepository
{
    private readonly AppDbContext _db;

    public InventoryRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Dictionary<string, int>> GetStockByIngredientIds(string groupId, List<string> ingredientIds)
    {
        if (ingredientIds.Count == 0 || !Guid.TryParse(groupId, out var groupGuid))
            return [];

        var ingGuids = ingredientIds
            .Where(id => Guid.TryParse(id, out _))
            .Select(Guid.Parse)
            .ToList();

        var rows = await _db.Inventory
            .Where(i => i.UserGroupId == groupGuid && ingGuids.Contains(i.IngredientId))
            .ToListAsync();

        return rows.ToDictionary(
            r => r.IngredientId.ToString(),
            r => r.Quantity);
    }

    public async Task SetStockQuantity(string groupId, string groupName, string ingredientId, string ingredientName, int stockQuantity)
    {
        if (!Guid.TryParse(groupId, out var groupGuid)) return;
        if (!Guid.TryParse(ingredientId, out var ingGuid)) return;

        var entity = await _db.Inventory
            .FirstOrDefaultAsync(i => i.IngredientId == ingGuid && i.UserGroupId == groupGuid);

        if (entity == null)
        {
            _db.Inventory.Add(new InventoryEntity
            {
                IngredientId = ingGuid,
                UserGroupId = groupGuid,
                Quantity = stockQuantity,
                UpdatedAt = DateTime.UtcNow,
            });
        }
        else
        {
            entity.Quantity = stockQuantity;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }

    public async Task IncrementStockQuantity(string groupId, string groupName, string ingredientId, string ingredientName, int amount)
    {
        if (!Guid.TryParse(groupId, out var groupGuid)) return;
        if (!Guid.TryParse(ingredientId, out var ingGuid)) return;

        var entity = await _db.Inventory
            .FirstOrDefaultAsync(i => i.IngredientId == ingGuid && i.UserGroupId == groupGuid);

        var current = entity?.Quantity ?? 0;
        var next = current + amount;

        if (next < 0)
            throw new ArgumentException("Ingredient stock cannot be reduced below zero.");

        if (entity == null)
        {
            _db.Inventory.Add(new InventoryEntity
            {
                IngredientId = ingGuid,
                UserGroupId = groupGuid,
                Quantity = next,
                UpdatedAt = DateTime.UtcNow,
            });
        }
        else
        {
            entity.Quantity = next;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }

    public async Task DeleteByIngredientId(string ingredientId)
    {
        if (!Guid.TryParse(ingredientId, out var ingGuid)) return;

        var rows = await _db.Inventory
            .Where(i => i.IngredientId == ingGuid)
            .ToListAsync();

        if (rows.Count > 0)
        {
            _db.Inventory.RemoveRange(rows);
            await _db.SaveChangesAsync();
        }
    }
}
