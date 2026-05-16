namespace FoodAndDrinkApi.Requests;

public class DrinkUpdateRequest
{
    public required string Id { get; init; }
    public IFormFile? Image { get; init; }
    public string? Name { get; init; }
    public bool? IsHealthyOption { get; init; }
    public List<MealIngredientRequest>? Ingredients { get; init; }
}
