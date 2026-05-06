namespace FoodAndDrinkRepository.Data.Entities;

public class UserGroupEntity
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<UserEntity> Users { get; set; } = [];
    public ICollection<InventoryEntity> Inventory { get; set; } = [];
    public ICollection<MealPlanEntity> MealPlanEntries { get; set; } = [];
    public ICollection<ShoppingListEntity> ShoppingLists { get; set; } = [];
}
