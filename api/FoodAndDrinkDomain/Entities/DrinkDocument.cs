using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

public class DrinkDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required int Rating { get; init; }
    public required bool IsHealthyOption { get; init; }
    public required int Cost { get; init; }
    public required List<string> Ingredients { get; init; }
    public required int Difficulty { get; init; }
    public required int Speed { get; init; }
    public string? ImagePath { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static implicit operator DrinkDocument(Drink model)
    {
        return new DrinkDocument
        {
            Id = model.Id,
            Name = model.Name,
            Rating = model.Rating,
            IsHealthyOption = model.IsHealthyOption,
            Cost = model.Cost,
            Ingredients = model.Ingredients,
            Difficulty = model.Difficulty,
            Speed = model.Speed,
            ImagePath = model.ImagePath,
            CreatedAt = model.CreatedAt,
            UpdatedAt = model.UpdatedAt
        };
    }
}