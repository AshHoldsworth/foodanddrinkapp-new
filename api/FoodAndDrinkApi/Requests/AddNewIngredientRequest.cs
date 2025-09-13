namespace FoodAndDrinkApi.Requests;

public class AddNewIngredientRequest
{
    public required string Name { get; init; }
    public required int Rating { get; init; }
    public required bool IsHealthyOption { get; init; }
    public required int Cost { get; init; }
    public required string Macro { get; init; }
    public List<string>? Barcodes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }  
}
