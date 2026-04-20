namespace FoodAndDrinkApi.Responses;

public class UserGroupResponse
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required DateTime CreatedAt { get; init; }
}