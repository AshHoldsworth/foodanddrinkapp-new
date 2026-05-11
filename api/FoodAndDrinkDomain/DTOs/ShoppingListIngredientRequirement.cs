namespace FoodAndDrinkDomain.DTOs;

public class ShoppingListIngredientRequirement
{
    public required string IngredientNameKey { get; init; }
    public required int Quantity { get; init; }
    public required string UoM { get; init; }
}
