namespace FoodAndDrinkDomain.Models;

public class UserGroup
{
    public string Id { get; init; }
    public string Name { get; init; }
    public DateTime CreatedAt { get; init; }

    public UserGroup(string id, string name, DateTime createdAt)
    {
        Id = id;
        Name = name;
        CreatedAt = createdAt;
    }

}
