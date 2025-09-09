namespace FoodAndDrinkApi.Requests;

public class IngredientListRequest
{
    public required List<string> IngredientIds { get; init; }
}