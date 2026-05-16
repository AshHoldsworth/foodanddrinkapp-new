using FoodAndDrinkDomain.Models;

namespace FoodAndDrinkDomain.DTOs;

public class MealUpdateDetails
{
    public required string Id { get; init; }
    public string? Name { get; init; }
    public bool? IsHealthyOption { get; init; }
    public List<MealIngredient>? Ingredients { get; init; }
    public string? Course { get; init; }
    public string? ImagePath { get; init; }
    public string? UpdatedBy { get; init; }
}
