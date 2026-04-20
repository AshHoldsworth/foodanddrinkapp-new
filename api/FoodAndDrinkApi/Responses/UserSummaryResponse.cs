namespace FoodAndDrinkApi.Responses;

public class UserSummaryResponse
{
    public required string Id { get; init; }
    public required string Username { get; init; }
    public required string Role { get; init; }
    public string? GroupId { get; init; }
    public string? GroupName { get; init; }
    public required DateTime CreatedAt { get; init; }
}
