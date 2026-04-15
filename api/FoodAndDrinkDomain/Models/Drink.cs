using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class Drink : BaseConsumable
{
    public List<string> Ingredients { get; private set; }
    public int Difficulty { get; private set; }
    public int Speed { get; private set; }
    public string? ImagePath { get; private set; }

    public Drink(string id, string name, int rating, bool isHealthyOption, int cost, List<string> ingredients, int difficulty, int speed, DateTime createdAt, DateTime? updatedAt = null, string? imagePath = null)
        : base(id, name, rating, isHealthyOption, cost, createdAt, updatedAt)
    {
        Ingredients = ingredients ?? throw new ArgumentNullException(nameof(ingredients));
        Difficulty = difficulty;
        Speed = speed;
        ImagePath = imagePath;
    }

    public void Update(DrinkUpdateDetails update)
    {
        if (update.Id == null) throw new DrinkIdIsNullException();

        if (update.Name == null &&
            update.Rating == null &&
            update.IsHealthyOption == null &&
            update.Cost == null &&
            update.Ingredients == null &&
            update.Difficulty == null &&
            update.Speed == null &&
            update.ImagePath == null)
        {
            throw new DrinkNoUpdatesDetectedException();
        }

        Name = update.Name ?? Name;
        Rating = update.Rating ?? Rating;
        IsHealthyOption = update.IsHealthyOption ?? IsHealthyOption;
        Cost = update.Cost ?? Cost;
        Ingredients = update.Ingredients ?? Ingredients;
        Difficulty = update.Difficulty ?? Difficulty;
        Speed = update.Speed ?? Speed;
        ImagePath = update.ImagePath ?? ImagePath;
        UpdatedAt = DateTime.UtcNow;
    }

    public static implicit operator Drink(DrinkDocument doc)
    {
        return new Drink(
            id: doc.Id,
            name: doc.Name,
            rating: doc.Rating,
            isHealthyOption: doc.IsHealthyOption,
            cost: doc.Cost,
            ingredients: doc.Ingredients,
            difficulty: doc.Difficulty,
            speed: doc.Speed,
            createdAt: doc.CreatedAt,
            updatedAt: doc.UpdatedAt,
            imagePath: doc.ImagePath
        );
    }
}
