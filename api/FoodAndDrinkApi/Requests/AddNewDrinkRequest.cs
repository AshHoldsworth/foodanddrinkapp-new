namespace FoodAndDrinkApi.Requests;

public class AddNewDrinkRequest
{
    public required string Name { get; init; }
    public IFormFile? Image { get; init; }
    public bool IsHealthyOption { get; init; }
    public required List<MealIngredientRequest> Ingredients { get; init; }
}
