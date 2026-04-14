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
