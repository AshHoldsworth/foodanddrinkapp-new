using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

public class MealPlanDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }

    public DateTime WeekStart { get; init; }
    public required List<MealPlanDayDocument> Days { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? LastModifiedBy { get; init; }
    public DateTime? LastModifiedAt { get; init; }

    public static implicit operator MealPlanDocument(MealPlan model)
    {
        return new MealPlanDocument
        {
            Id = model.Id,
            WeekStart = model.WeekStart,
            Days = model.Days.Select(day => (MealPlanDayDocument)day).ToList(),
            CreatedAt = model.CreatedAt,
            LastModifiedBy = model.LastModifiedBy,
            LastModifiedAt = model.LastModifiedAt,
        };
    }
}
