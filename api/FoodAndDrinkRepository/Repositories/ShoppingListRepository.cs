using FoodAndDrinkDomain.Enums;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Data;
using FoodAndDrinkRepository.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodAndDrinkRepository.Repositories;

public interface IShoppingListRepository
{
    Task<ShoppingList?> GetActive(string groupId);
    Task<ShoppingList?> GetById(string groupId, string id);
    Task<List<ShoppingList>> GetCompleted(string groupId, int limit);
    Task Insert(ShoppingList shoppingList);
    Task Replace(ShoppingList shoppingList);
    Task Delete(string id);
}

public class ShoppingListRepository : IShoppingListRepository
{
    private readonly AppDbContext _db;

    public ShoppingListRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ShoppingList?> GetActive(string groupId)
    {
        if (!Guid.TryParse(groupId, out var groupGuid)) return null;

        var entity = await _db.ShoppingLists
            .Include(s => s.UserGroup)
            .Include(s => s.Ingredients)
                .ThenInclude(i => i.Ingredient)
            .Where(s => s.UserGroupId == groupGuid && !s.IsComplete)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        return entity == null ? null : ToModel(entity);
    }

    public async Task<ShoppingList?> GetById(string groupId, string id)
    {
        if (!Guid.TryParse(groupId, out var groupGuid)) return null;
        if (!Guid.TryParse(id, out var listGuid)) return null;

        var entity = await _db.ShoppingLists
            .Include(s => s.UserGroup)
            .Include(s => s.Ingredients)
                .ThenInclude(i => i.Ingredient)
            .FirstOrDefaultAsync(s => s.UserGroupId == groupGuid && s.Id == listGuid);

        return entity == null ? null : ToModel(entity);
    }

    public async Task<List<ShoppingList>> GetCompleted(string groupId, int limit)
    {
        if (!Guid.TryParse(groupId, out var groupGuid)) return [];

        var entities = await _db.ShoppingLists
            .Include(s => s.UserGroup)
            .Include(s => s.Ingredients)
                .ThenInclude(i => i.Ingredient)
            .Where(s => s.UserGroupId == groupGuid && s.IsComplete)
            .OrderByDescending(s => s.CompletedAt)
            .Take(limit)
            .ToListAsync();

        return entities.Select(ToModel).ToList();
    }

    public async Task Insert(ShoppingList shoppingList)
    {
        _db.ShoppingLists.Add(ToEntity(shoppingList));
        await _db.SaveChangesAsync();
    }

    public async Task Replace(ShoppingList shoppingList)
    {
        if (!Guid.TryParse(shoppingList.Id, out var guid)) return;

        var entity = await _db.ShoppingLists
            .Include(s => s.Ingredients)
            .FirstOrDefaultAsync(s => s.Id == guid);

        if (entity == null) return;

        entity.IsComplete = shoppingList.IsCompleted;
        entity.IsManual = shoppingList.Type == ShoppingListType.Manual;
        entity.CompletedAt = shoppingList.CompletedAt;
        entity.CompletedBy = shoppingList.CompletedBy;
        entity.UpdatedBy = shoppingList.LastModifiedBy;
        entity.UpdatedAt = shoppingList.LastModifiedAt;

        entity.Ingredients.Clear();
        foreach (var item in shoppingList.Items)
        {
            if (!Guid.TryParse(item.IngredientId, out var ingGuid)) continue;
            entity.Ingredients.Add(new ShoppingListIngredientEntity
            {
                ShoppingListId = guid,
                IngredientId = ingGuid,
                Quantity = item.Quantity,
                UoM = string.IsNullOrWhiteSpace(item.UoM) ? "Portions" : item.UoM,
                Purchased = item.IsPurchased,
                PurchasedAt = item.PurchasedAt,
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task Delete(string id)
    {
        if (!Guid.TryParse(id, out var guid)) return;

        var entity = await _db.ShoppingLists.FindAsync(guid);
        if (entity == null) return;

        _db.ShoppingLists.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private static ShoppingList ToModel(ShoppingListEntity entity)
    {
        var items = entity.Ingredients
            .Select(i => new ShoppingListItem(
                ingredientId: i.IngredientId.ToString(),
                ingredientName: i.Ingredient?.Name ?? string.Empty,
                quantity: i.Quantity,
                uoM: string.IsNullOrWhiteSpace(i.UoM) ? "Portions" : i.UoM,
                isPurchased: i.Purchased,
                purchasedAt: i.PurchasedAt))
            .ToList();

        return new ShoppingList(
            id: entity.Id.ToString(),
            groupId: entity.UserGroupId.ToString(),
            groupName: entity.UserGroup?.Name,
            startDate: entity.StartDate,
            endDate: entity.EndDate,
            items: items,
            createdAt: entity.CreatedAt,
            type: entity.IsManual ? ShoppingListType.Manual : ShoppingListType.Generated,
            isCompleted: entity.IsComplete,
            completedAt: entity.CompletedAt,
            completedBy: entity.CompletedBy,
            lastModifiedBy: entity.UpdatedBy,
            lastModifiedAt: entity.UpdatedAt);
    }

    private static ShoppingListEntity ToEntity(ShoppingList shoppingList)
    {
        var id = Guid.TryParse(shoppingList.Id, out var guid) ? guid : Guid.NewGuid();
        var groupGuid = Guid.TryParse(shoppingList.GroupId, out var gg) ? gg : Guid.NewGuid();

        var entity = new ShoppingListEntity
        {
            Id = id,
            UserGroupId = groupGuid,
            StartDate = shoppingList.StartDate,
            EndDate = shoppingList.EndDate,
            IsComplete = shoppingList.IsCompleted,
            IsManual = shoppingList.Type == ShoppingListType.Manual,
            CompletedAt = shoppingList.CompletedAt,
            CompletedBy = shoppingList.CompletedBy,
            CreatedBy = shoppingList.LastModifiedBy,
            CreatedAt = shoppingList.CreatedAt,
            UpdatedBy = shoppingList.LastModifiedBy,
            UpdatedAt = shoppingList.LastModifiedAt,
        };

        foreach (var item in shoppingList.Items)
        {
            if (!Guid.TryParse(item.IngredientId, out var ingGuid)) continue;
            entity.Ingredients.Add(new ShoppingListIngredientEntity
            {
                ShoppingListId = id,
                IngredientId = ingGuid,
                Quantity = item.Quantity,
                UoM = string.IsNullOrWhiteSpace(item.UoM) ? "Portions" : item.UoM,
                Purchased = item.IsPurchased,
                PurchasedAt = item.PurchasedAt,
            });
        }

        return entity;
    }
}
