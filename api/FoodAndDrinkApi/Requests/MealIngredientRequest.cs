namespace FoodAndDrinkApi.Requests;

public class MealIngredientRequest
{
    public required string IngredientId { get; init; }
    public string? Preparation { get; init; }
    public decimal? Quantity { get; init; }
    public string? UoM { get; init; }
}
