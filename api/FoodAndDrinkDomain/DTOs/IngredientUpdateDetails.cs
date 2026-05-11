namespace FoodAndDrinkDomain.DTOs;

public class IngredientUpdateDetails
{
    public required string Id { get; init; }
    public string? Name { get; init; }
    public int? Rating { get; init; }
    public bool? IsHealthyOption { get; init; }
    public int? Cost { get; init; }
    public string? Macro { get; init; }
    public string UoM { get; init; } = string.Empty;
    public int? StockQuantity { get; init; }
    public string StockUoM { get; init; } = string.Empty;
    public List<string>? Barcodes { get; init; }
    public string? UpdatedBy { get; init; }
}
