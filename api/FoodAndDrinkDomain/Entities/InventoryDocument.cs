using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

[BsonIgnoreExtraElements]
public class InventoryDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }

    public required string GroupId { get; init; }
    public string? GroupName { get; init; }
    public List<InventoryProductDocument> Products { get; init; } = [];
    public DateTime UpdatedAt { get; init; }

    public static implicit operator InventoryDocument(Inventory model)
    {
        return new InventoryDocument
        {
            Id = model.Id,
            GroupId = model.GroupId,
            GroupName = model.GroupName,
            Products = model.Products.Select(product => (InventoryProductDocument)product).ToList(),
            UpdatedAt = model.UpdatedAt,
        };
    }
}

public class InventoryProductDocument
{
    public required string IngredientId { get; init; }
    public string? IngredientName { get; init; }
    public required int StockQuantity { get; init; }

    public static implicit operator InventoryProductDocument(InventoryProduct model)
    {
        return new InventoryProductDocument
        {
            IngredientId = model.IngredientId,
            IngredientName = model.IngredientName,
            StockQuantity = model.StockQuantity,
        };
    }
}
