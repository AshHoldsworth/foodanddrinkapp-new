using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Exceptions;

namespace FoodAndDrinkDomain.Models;

public class Food : BaseConsumable
{
    public List<string> Ingredients { get; private set; }
    public string Course { get; private set; }
    public int Difficulty { get; private set; }
    public int Speed { get; private set; }

    public Food(string id, string name, int rating, bool isHealthyOption, int cost, List<string> ingredients, string course, int difficulty, int speed)
        : base(id, name, rating, isHealthyOption, cost)
    {
        Ingredients = ingredients ?? throw new ArgumentNullException(nameof(ingredients));
        Course = course ?? throw new ArgumentNullException(nameof(course));
        Difficulty = difficulty;
        Speed = speed;
    }

    public void Update(FoodUpdateDetails update)
    {
        if (update.Id == null) throw new FoodIdIsNullException();

        if (update.Name == null &&
            update.Rating == null &&
            update.IsHealthyOption == null &&
            update.Cost == null &&
            update.Course == null &&
            update.Difficulty == null &&
            update.Speed == null &&
            update.Ingredients == null)
        {
            throw new FoodNoUpdatesDetectedException();
        }
        
        Name = update.Name ?? Name;
        Rating = update.Rating ?? Rating;
        IsHealthyOption = update.IsHealthyOption ?? IsHealthyOption;
        Cost = update.Cost ?? Cost;
        Course = update.Course ?? Course;
        Difficulty = update.Difficulty ?? Difficulty;
        Speed = update.Speed ?? Speed;
        Ingredients = update.Ingredients ?? Ingredients;
        UpdatedAt = DateTime.UtcNow;
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