using FoodAndDrinkDomain.Models;

namespace FoodAndDrinkApi.Requests;

public class MealUpdateRequest
{
    public required string Id { get; init; }
    public IFormFile? Image { get; init; }
    public string? Name { get; init; }
    public bool? IsHealthyOption { get; init; }
    public List<MealIngredientRequest>? Ingredients { get; init; }
    public string? Course { get; init; }
}
