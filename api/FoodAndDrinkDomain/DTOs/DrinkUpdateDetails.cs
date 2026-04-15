namespace FoodAndDrinkDomain.DTOs;

public class DrinkUpdateDetails
{
    public required string Id { get; init; }
    public string? Name { get; init; }
    public int? Rating { get; init; }
    public bool? IsHealthyOption { get; init; }
    public int? Cost { get; init; }
    public List<string>? Ingredients { get; init; }
    public int? Difficulty { get; init; }
    public int? Speed { get; init; }
    public string? ImagePath { get; init; }
}