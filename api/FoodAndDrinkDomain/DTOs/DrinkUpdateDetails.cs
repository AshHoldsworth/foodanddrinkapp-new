namespace FoodAndDrinkDomain.DTOs;

using FoodAndDrinkDomain.Models;

public class DrinkUpdateDetails
{
    public required string Id { get; init; }
    public string? Name { get; init; }
    public bool? IsHealthyOption { get; init; }
    public List<MealIngredient>? Ingredients { get; init; }
    public string? ImagePath { get; init; }
}
