namespace FoodAndDrinkApi.Requests;

public class AddNewMealRequest
{
    public required string Name { get; init; }
    public IFormFile? Image { get; init; }
    public bool IsHealthyOption { get; init; }
    public required List<MealIngredientRequest> Ingredients { get; init; }
    public required string Course { get; init; }
}
