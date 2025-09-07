using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class Food : BaseConsumable
{
    public List<Ingredient> Ingredients { get; init; }
    public string Course { get; init; }
    public int Difficulty { get; init; }
    public int Speed { get; init; }

    public Food(string id, string name, int rating, bool isHealthyOption, int cost, List<Ingredient> ingredients, string course, int difficulty, int speed)
        : base(id, name, rating, isHealthyOption, cost)
    {
        Ingredients = ingredients ?? throw new ArgumentNullException(nameof(ingredients));
        Course = course ?? throw new ArgumentNullException(nameof(course));
        Difficulty = difficulty;
        Speed = speed;
    }

    public static implicit operator Food(FoodDocument doc)
    {
        return new Food(
            id: doc.Id,
            name: doc.Name,
            rating: doc.Rating,
            isHealthyOption: doc.IsHealthyOption,
            cost: doc.Cost,
            ingredients: doc.Ingredients,
            course: doc.Course,
            difficulty: doc.Difficulty,
            speed: doc.Speed
        );
    }
}