using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;

namespace FoodAndDrinkDomain.Models;

public class Meal : BaseConsumable
{
    public List<MealIngredient> Ingredients { get; private set; }
    public string? ImagePath { get; private set; }
    public string Course { get; private set; }
    public string? CreatedBy { get; private set; }
    public string? UpdatedBy { get; private set; }

    public Meal(string id, string name, bool isHealthyOption, List<MealIngredient> ingredients, string course, DateTime createdAt, DateTime? updatedAt = null, string? imagePath = null, string? createdBy = null, string? updatedBy = null)
        : base(id, name, isHealthyOption, createdAt, updatedAt)
    {
        Ingredients = ingredients ?? throw new ArgumentNullException(nameof(ingredients));
        ImagePath = imagePath;
        Course = course ?? throw new ArgumentNullException(nameof(course));
        CreatedBy = createdBy;
        UpdatedBy = updatedBy;
    }

    public void Update(MealUpdateDetails update)
    {
        if (update.Id == null) throw new MealIdIsNullException();

        if (update.Name == null &&
            update.IsHealthyOption == null &&
            update.Course == null &&
            update.Ingredients == null &&
            update.ImagePath == null)
        {
            throw new MealNoUpdatesDetectedException();
        }

        Name = update.Name ?? Name;
        IsHealthyOption = update.IsHealthyOption ?? IsHealthyOption;
        Course = update.Course ?? Course;
        Ingredients = update.Ingredients ?? Ingredients;
        ImagePath = update.ImagePath ?? ImagePath;
        UpdatedBy = update.UpdatedBy ?? UpdatedBy;
        UpdatedAt = DateTime.UtcNow;
    }
}
