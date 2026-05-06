namespace FoodAndDrinkRepository.Data.Entities;

/// <summary>Composite PK: (MealId, IngredientId)</summary>
public class MealIngredientEntity
{
    public Guid MealId { get; set; }
    public Guid IngredientId { get; set; }
    public string? Preparation { get; set; }
    public decimal? Quantity { get; set; }
    public string? UoM { get; set; }

    public MealEntity Meal { get; set; } = null!;
    public IngredientEntity Ingredient { get; set; } = null!;
}
