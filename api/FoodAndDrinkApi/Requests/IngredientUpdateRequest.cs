namespace FoodAndDrinkApi.Requests;

public class IngredientUpdateRequest
{
    public required string Id { get; init; }
    public string? Name { get; init; } = null;
    public int? Rating { get; init; } = null;
    public bool? IsHealthyOption { get; init; } = null;
    public int? Cost { get; init; } = null;
    public string? Macro { get; init; } = null;
    public List<string>? Barcodes { get; init; } = null;
}