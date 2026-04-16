namespace FoodAndDrinkApi.Requests;

public class MealIngredientRequest
{
    public required string Name { get; init; }
    public string? Macro { get; init; }
}
