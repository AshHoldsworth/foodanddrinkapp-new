using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class User
{
    public string Id { get; init; }
    public string Username { get; init; }
    public string Role { get; init; }
    public string? GroupId { get; init; }
    public string? GroupName { get; init; }
    public string PasswordHash { get; init; }
    public string PasswordSalt { get; init; }
    public DateTime CreatedAt { get; init; }

    public User(
        string id,
        string username,
        string role,
        string passwordHash,
        string passwordSalt,
        DateTime createdAt,
        string? groupId = null,
        string? groupName = null)
    {
        Id = id;
        Username = username;
        Role = role;
        GroupId = groupId;
        GroupName = groupName;
        PasswordHash = passwordHash;
        PasswordSalt = passwordSalt;
        CreatedAt = createdAt;
    }

    public User WithProfile(string username, string role, string? groupId, string? groupName)
    {
        return new User(
            id: Id,
            username: username,
            role: role,
            passwordHash: PasswordHash,
            passwordSalt: PasswordSalt,
            createdAt: CreatedAt,
            groupId: groupId,
            groupName: groupName
        );
    }

    public User WithPassword(string passwordHash, string passwordSalt)
    {
        return new User(
            id: Id,
            username: Username,
            role: Role,
            passwordHash: passwordHash,
            passwordSalt: passwordSalt,
            createdAt: CreatedAt,
            groupId: GroupId,
            groupName: GroupName
        );
    }

    public static implicit operator User(UserDocument doc)
    {
        return new User(
            id: doc.Id,
            username: doc.Username,
            role: doc.Role,
            passwordHash: doc.PasswordHash,
            passwordSalt: doc.PasswordSalt,
            createdAt: doc.CreatedAt,
            groupId: doc.GroupId,
            groupName: doc.GroupName
        );
    }
}
