using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

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
    public List<string>? Barcodes { get; init; }

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
            Barcodes = model.Barcodes,
        };
    }
}