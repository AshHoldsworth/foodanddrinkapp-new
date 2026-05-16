using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;

namespace FoodAndDrinkDomain.Models;

public class Drink : BaseConsumable
{
    public List<MealIngredient> Ingredients { get; private set; }
    public string? ImagePath { get; private set; }

    public Drink(string id, string name, bool isHealthyOption, List<MealIngredient> ingredients, DateTime createdAt, DateTime? updatedAt = null, string? imagePath = null)
        : base(id, name, isHealthyOption, createdAt, updatedAt)
    {
        Ingredients = ingredients ?? throw new ArgumentNullException(nameof(ingredients));
        ImagePath = imagePath;
    }

    public void Update(DrinkUpdateDetails update)
    {
        if (update.Id == null) throw new DrinkIdIsNullException();

        if (update.Name == null &&
            update.IsHealthyOption == null &&
            update.Ingredients == null &&
            update.ImagePath == null)
        {
            throw new DrinkNoUpdatesDetectedException();
        }

        Name = update.Name ?? Name;
        IsHealthyOption = update.IsHealthyOption ?? IsHealthyOption;
        Ingredients = update.Ingredients ?? Ingredients;
        ImagePath = update.ImagePath ?? ImagePath;
        UpdatedAt = DateTime.UtcNow;
    }
}
