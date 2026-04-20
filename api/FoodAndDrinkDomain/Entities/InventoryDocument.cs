using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

public class InventoryDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }

    public required string GroupId { get; init; }
    public required string IngredientId { get; init; }
    public required int StockQuantity { get; init; }
    public DateTime UpdatedAt { get; init; }

    public static implicit operator InventoryDocument(InventoryItem model)
    {
        return new InventoryDocument
        {
            Id = model.Id,
            GroupId = model.GroupId,
            IngredientId = model.IngredientId,
            StockQuantity = model.StockQuantity,
            UpdatedAt = model.UpdatedAt,
        };
    }
}