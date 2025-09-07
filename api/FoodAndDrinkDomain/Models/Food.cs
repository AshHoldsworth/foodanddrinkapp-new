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

    private Food()
    {
        if (Ingredients == null || Ingredients.Count == 0) throw new ArgumentNullException(nameof(Ingredients));
        if (Course == null) throw new ArgumentNullException(nameof(Course));
        if (Difficulty == 0) throw new ArgumentNullException(nameof(Difficulty));
        if (Speed == 0) throw new ArgumentNullException(nameof(Speed));
    }

    public static implicit operator Food(FoodDocument doc)
    {
        return new Food
        {
            Id = doc.Id,
            Name = doc.Name,
            Rating = doc.Rating,
            IsHealthyOption = doc.IsHealthyOption,
            Cost = doc.Cost,
            Ingredients = doc.Ingredients,
            Course = doc.Course,
            Difficulty = doc.Difficulty,
            Speed = doc.Speed,
        };
    }
}