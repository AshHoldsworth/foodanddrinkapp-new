namespace FoodAndDrinkRepository.Data.Entities;

public class ShoppingListEntity
{
    public Guid Id { get; set; }
    public Guid UserGroupId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsComplete { get; set; }
    public bool IsManual { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? CompletedBy { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public UserGroupEntity UserGroup { get; set; } = null!;
    public ICollection<ShoppingListIngredientEntity> Ingredients { get; set; } = [];
}
