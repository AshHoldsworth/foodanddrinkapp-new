using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Linq;

namespace FoodAndDrinkDomain.Entities;

public class MealDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required int Rating { get; init; }
    public required bool IsHealthyOption { get; init; }
    public required int Cost { get; init; }
    public required List<BsonValue> Ingredients { get; init; }
    public string? ImagePath { get; init; }
    public required string Course { get; init; }
    public required int Difficulty { get; init; }
    public required int Speed { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static implicit operator MealDocument(Meal model)
    {
        return new MealDocument
        {
            Id = model.Id,
            Name = model.Name,
            Rating = model.Rating,
            IsHealthyOption = model.IsHealthyOption,
            Cost = model.Cost,
            Ingredients = model.Ingredients
                .Select(ingredient =>
                {
                    var ingredientDoc = new BsonDocument
                    {
                        { "name", ingredient.Name }
                    };

                    if (!string.IsNullOrWhiteSpace(ingredient.Macro))
                    {
                        ingredientDoc.Add("macro", ingredient.Macro);
                    }

                    return (BsonValue)ingredientDoc;
                })
                .ToList(),
            ImagePath = model.ImagePath,
            Course = model.Course,
            Difficulty = model.Difficulty,
            Speed = model.Speed,
            CreatedAt = model.CreatedAt,
            UpdatedAt = model.UpdatedAt,
        };
    }
}
