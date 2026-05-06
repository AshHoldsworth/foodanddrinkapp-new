namespace FoodAndDrinkRepository.Data.Entities;

public class MealEntity
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsHealthyOption { get; set; }
    public string? ImagePath { get; set; }
    public required string Course { get; set; }
    public int Difficulty { get; set; }
    public int Cost { get; set; }
    public int Rating { get; set; }
    public int Speed { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<MealIngredientEntity> Ingredients { get; set; } = [];
    public ICollection<MealPlanEntity> MealPlanEntries { get; set; } = [];
}
