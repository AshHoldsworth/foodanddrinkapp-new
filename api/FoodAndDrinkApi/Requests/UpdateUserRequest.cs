namespace FoodAndDrinkApi.Requests;

public class UpdateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
}
