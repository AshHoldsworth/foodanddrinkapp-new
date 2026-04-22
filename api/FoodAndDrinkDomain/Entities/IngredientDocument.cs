using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

[BsonIgnoreExtraElements]
public class IngredientDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required int Rating { get; init; }
    public required bool IsHealthyOption { get; init; }
    public required int Cost { get; init; }
    public required string Macro { get; init; }
    public int StockQuantity { get; init; }
    public List<string>? Barcodes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    // Legacy lowercase fields for backward compatibility with older seeded documents.
    [BsonElement("name")]
    public string? LegacyName { get; init; }
    [BsonElement("rating")]
    public int? LegacyRating { get; init; }
    [BsonElement("isHealthyOption")]
    public bool? LegacyIsHealthyOption { get; init; }
    [BsonElement("cost")]
    public int? LegacyCost { get; init; }
    [BsonElement("macro")]
    public string? LegacyMacro { get; init; }
    [BsonElement("stockQuantity")]
    public int? LegacyStockQuantity { get; init; }
    [BsonElement("barcodes")]
    public List<string>? LegacyBarcodes { get; init; }
    [BsonElement("createdAt")]
    public DateTime? LegacyCreatedAt { get; init; }
    [BsonElement("updatedAt")]
    public DateTime? LegacyUpdatedAt { get; init; }

    public static implicit operator IngredientDocument(Ingredient model)
    {
        return new IngredientDocument
        {
            Id = model.Id,
            Name = model.Name,
            Rating = model.Rating,
            IsHealthyOption = model.IsHealthyOption,
            Cost = model.Cost,
            Macro = model.Macro,
            StockQuantity = model.StockQuantity,
            Barcodes = model.Barcodes,
            CreatedAt = model.CreatedAt,
            UpdatedAt = model.UpdatedAt
        };
    }
}
