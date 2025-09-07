namespace FoodAndDrinkDomain.DTOs;

public class IngredientUpdateDetails
{
    public required string Id { get; init; }
    public string? Name { get; init; }
    public int? Rating { get; init; }
    public bool? IsHealthyOption { get; init; }
    public int? Cost { get; init; }
    public string? Macro { get; init; }
    public List<string>? Barcodes { get; init; }
}