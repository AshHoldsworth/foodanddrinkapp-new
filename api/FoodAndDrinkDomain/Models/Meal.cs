using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;

namespace FoodAndDrinkDomain.Models;

public class Meal : BaseConsumable
{
    public List<MealIngredient> Ingredients { get; private set; }
    public string? ImagePath { get; private set; }
    public string Course { get; private set; }
    public int Difficulty { get; private set; }
    public int Speed { get; private set; }
    public string? CreatedBy { get; private set; }
    public string? UpdatedBy { get; private set; }

    public Meal(string id, string name, int rating, bool isHealthyOption, int cost, List<MealIngredient> ingredients, string course, int difficulty, int speed, DateTime createdAt, DateTime? updatedAt = null, string? imagePath = null, string? createdBy = null, string? updatedBy = null)
        : base(id, name, rating, isHealthyOption, cost, createdAt, updatedAt)
    {
        Ingredients = ingredients ?? throw new ArgumentNullException(nameof(ingredients));
        ImagePath = imagePath;
        Course = course ?? throw new ArgumentNullException(nameof(course));
        Difficulty = difficulty;
        Speed = speed;
        CreatedBy = createdBy;
        UpdatedBy = updatedBy;
    }

    public void Update(MealUpdateDetails update)
    {
        if (update.Id == null) throw new MealIdIsNullException();

        if (update.Name == null &&
            update.Rating == null &&
            update.IsHealthyOption == null &&
            update.Cost == null &&
            update.Course == null &&
            update.Difficulty == null &&
            update.Speed == null &&
            update.Ingredients == null &&
            update.ImagePath == null)
        {
            throw new MealNoUpdatesDetectedException();
        }

        Name = update.Name ?? Name;
        Rating = update.Rating ?? Rating;
        IsHealthyOption = update.IsHealthyOption ?? IsHealthyOption;
        Cost = update.Cost ?? Cost;
        Course = update.Course ?? Course;
        Difficulty = update.Difficulty ?? Difficulty;
        Speed = update.Speed ?? Speed;
        Ingredients = update.Ingredients ?? Ingredients;
        ImagePath = update.ImagePath ?? ImagePath;
        UpdatedBy = update.UpdatedBy ?? UpdatedBy;
        UpdatedAt = DateTime.UtcNow;
    }
}
