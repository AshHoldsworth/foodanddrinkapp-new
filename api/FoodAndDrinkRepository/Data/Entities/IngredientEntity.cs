namespace FoodAndDrinkRepository.Data.Entities;

public class IngredientEntity
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsHealthyOption { get; set; }
    public required string Macro { get; set; }
    public int Cost { get; set; }
    public int Rating { get; set; }
    public string[]? Barcodes { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<MealIngredientEntity> MealIngredients { get; set; } = [];
    public ICollection<InventoryEntity> Inventory { get; set; } = [];
    public ICollection<ShoppingListIngredientEntity> ShoppingListIngredients { get; set; } = [];
}
