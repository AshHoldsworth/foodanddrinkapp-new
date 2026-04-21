using FoodAndDrinkDomain.Enums;
using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

public class ShoppingListDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }

    public required string GroupId { get; init; }
    public string? GroupName { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public required List<ShoppingListItemDocument> Items { get; init; }
    public ShoppingListType Type { get; init; } = ShoppingListType.Generated;
    public bool IsCompleted { get; init; }
    public DateTime? CompletedAt { get; init; }
    public string? CompletedBy { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? LastModifiedBy { get; init; }
    public DateTime? LastModifiedAt { get; init; }

    public static implicit operator ShoppingListDocument(ShoppingList model)
    {
        return new ShoppingListDocument
        {
            Id = model.Id,
            GroupId = model.GroupId,
            GroupName = model.GroupName,
            StartDate = model.StartDate,
            EndDate = model.EndDate,
            Items = model.Items.Select(item => (ShoppingListItemDocument)item).ToList(),
            Type = model.Type,
            IsCompleted = model.IsCompleted,
            CompletedAt = model.CompletedAt,
            CompletedBy = model.CompletedBy,
            CreatedAt = model.CreatedAt,
            LastModifiedBy = model.LastModifiedBy,
            LastModifiedAt = model.LastModifiedAt,
        };
    }
}
