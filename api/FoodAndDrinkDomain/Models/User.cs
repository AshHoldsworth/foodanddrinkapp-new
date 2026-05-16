namespace FoodAndDrinkDomain.Models;

public class User
{
    public string Id { get; init; }
    public string Username { get; init; }
    public string Role { get; init; }
    public string? GroupId { get; init; }
    public string? GroupName { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? CreatedBy { get; init; }

    public User(
        string id,
        string username,
        string role,
        DateTime createdAt,
        string? createdBy = null,
        string? groupId = null,
        string? groupName = null)
    {
        Id = id;
        Username = username;
        Role = role;
        GroupId = groupId;
        GroupName = groupName;
        CreatedAt = createdAt;
        CreatedBy = createdBy;
    }

    public User WithProfile(string username, string role, string? groupId, string? groupName)
    {
        return new User(
            id: Id,
            username: username,
            role: role,
            createdAt: CreatedAt,
            createdBy: CreatedBy,
            groupId: groupId,
            groupName: groupName
        );
    }
}
