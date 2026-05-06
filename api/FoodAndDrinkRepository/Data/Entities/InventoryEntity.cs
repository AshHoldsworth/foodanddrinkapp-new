namespace FoodAndDrinkRepository.Data.Entities;

/// <summary>Composite PK: (IngredientId, UserGroupId)</summary>
public class InventoryEntity
{
    public Guid IngredientId { get; set; }
    public Guid UserGroupId { get; set; }
    public int Quantity { get; set; }
    public string? UoM { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public IngredientEntity Ingredient { get; set; } = null!;
    public UserGroupEntity UserGroup { get; set; } = null!;
}
