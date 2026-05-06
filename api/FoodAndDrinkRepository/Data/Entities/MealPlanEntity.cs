namespace FoodAndDrinkRepository.Data.Entities;

/// <summary>
/// One row per meal slot per day per group.
/// Composite PK: (Date, MealSlot, UserGroupId).
/// MealSlot is "Lunch" or "Dinner".
/// </summary>
public class MealPlanEntity
{
    public DateTime Date { get; set; }
    public required string MealSlot { get; set; }
    public Guid UserGroupId { get; set; }
    public Guid? MealId { get; set; }

    public UserGroupEntity UserGroup { get; set; } = null!;
    public MealEntity? Meal { get; set; }
}
