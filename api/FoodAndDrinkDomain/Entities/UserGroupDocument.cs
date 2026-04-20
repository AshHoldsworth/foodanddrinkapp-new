using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

public class UserGroupDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }

    public required string Name { get; init; }
    public DateTime CreatedAt { get; init; }

    public static implicit operator UserGroupDocument(UserGroup model)
    {
        return new UserGroupDocument
        {
            Id = model.Id,
            Name = model.Name,
            CreatedAt = model.CreatedAt,
        };
    }
}
