using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class InventoryItem
{
    public string Id { get; init; }
    public string GroupId { get; init; }
    public string IngredientId { get; init; }
    public int StockQuantity { get; init; }
    public DateTime UpdatedAt { get; init; }

    public InventoryItem(string id, string groupId, string ingredientId, int stockQuantity, DateTime updatedAt)
    {
        Id = id;
        GroupId = groupId;
        IngredientId = ingredientId;
        StockQuantity = stockQuantity;
        UpdatedAt = updatedAt;
    }

    public static implicit operator InventoryItem(InventoryDocument doc)
    {
        return new InventoryItem(
            id: doc.Id,
            groupId: doc.GroupId,
            ingredientId: doc.IngredientId,
            stockQuantity: doc.StockQuantity,
            updatedAt: doc.UpdatedAt
        );
    }
}