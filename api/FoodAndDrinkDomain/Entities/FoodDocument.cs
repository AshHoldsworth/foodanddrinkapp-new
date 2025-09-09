using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

public class FoodDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required int Rating { get; init; }
    public required bool IsHealthyOption { get; init; }
    public required int Cost { get; init; }
    public required List<string> Ingredients { get; init; }
    public required string Course { get; init; }
    public required int Difficulty { get; init; }
    public required int Speed { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static implicit operator FoodDocument(Food model)
    {
        return new FoodDocument
        {
            Id = model.Id,
            Name = model.Name,
            Rating = model.Rating,
            IsHealthyOption = model.IsHealthyOption,
            Cost = model.Cost,
            Ingredients = model.Ingredients,
            Course = model.Course,
            Difficulty = model.Difficulty,
            Speed = model.Speed,
            CreatedAt = model.CreatedAt,
            UpdatedAt = model.UpdatedAt,       
        };
    }
}