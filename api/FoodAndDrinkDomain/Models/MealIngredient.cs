namespace FoodAndDrinkDomain.Models;

public record MealIngredient(
    string IngredientId,
    string Name,
    string? Macro,
    string? Preparation = null,
    decimal? Quantity = null,
    string UoM = "Portions");
