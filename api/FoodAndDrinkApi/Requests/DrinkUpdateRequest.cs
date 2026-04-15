namespace FoodAndDrinkApi.Requests;

public class DrinkUpdateRequest
{
    public required string Id { get; init; }
    public IFormFile? Image { get; init; }
    public string? Name { get; init; }
    public int? Rating { get; init; }
    public bool? IsHealthyOption { get; init; }
    public int? Cost { get; init; }
    public List<string>? Ingredients { get; init; }
    public int? Difficulty { get; init; }
    public int? Speed { get; init; }
}
