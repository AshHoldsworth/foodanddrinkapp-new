using FoodAndDrinkDomain.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodAndDrinkDomain.Entities;

public class UserDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; init; }
    public required string Username { get; init; }
    public required string Role { get; init; }
    public string? GroupId { get; init; }
    public required string PasswordHash { get; init; }
    public required string PasswordSalt { get; init; }
    public DateTime CreatedAt { get; init; }

    public static implicit operator UserDocument(User model)
    {
        return new UserDocument
        {
            Id = model.Id,
            Username = model.Username,
            Role = model.Role,
            GroupId = model.GroupId,
            PasswordHash = model.PasswordHash,
            PasswordSalt = model.PasswordSalt,
            CreatedAt = model.CreatedAt,
        };
    }
}
