namespace FoodAndDrinkRepository.Data.Entities;

/// <summary>Composite PK: (ShoppingListId, IngredientId)</summary>
public class ShoppingListIngredientEntity
{
    public Guid ShoppingListId { get; set; }
    public Guid IngredientId { get; set; }
    public int Quantity { get; set; }
    public string? UoM { get; set; }
    public bool Purchased { get; set; }
    public DateTime? PurchasedAt { get; set; }

    public ShoppingListEntity ShoppingList { get; set; } = null!;
    public IngredientEntity Ingredient { get; set; } = null!;
}
