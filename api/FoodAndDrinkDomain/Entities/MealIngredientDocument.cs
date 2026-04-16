using FoodAndDrinkDomain.Models;

namespace FoodAndDrinkDomain.Entities;

public class MealIngredientDocument
{
    public required string Name { get; init; }
    public string? Macro { get; init; }

    public static implicit operator MealIngredientDocument(MealIngredient model)
    {
        return new MealIngredientDocument
        {
            Name = model.Name,
            Macro = model.Macro,
        };
    }

    public static implicit operator MealIngredient(MealIngredientDocument document)
    {
        return new MealIngredient(document.Name, document.Macro);
    }
}
