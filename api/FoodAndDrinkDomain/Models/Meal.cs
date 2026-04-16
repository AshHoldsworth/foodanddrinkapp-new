using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Exceptions;
using MongoDB.Bson;
using System.Linq;

namespace FoodAndDrinkDomain.Models;

public class Meal : BaseConsumable
{
    public List<MealIngredient> Ingredients { get; private set; }
    public string? ImagePath { get; private set; }
    public string Course { get; private set; }
    public int Difficulty { get; private set; }
    public int Speed { get; private set; }

    public Meal(string id, string name, int rating, bool isHealthyOption, int cost, List<MealIngredient> ingredients, string course, int difficulty, int speed, DateTime createdAt, DateTime? updatedAt = null, string? imagePath = null)
        : base(id, name, rating, isHealthyOption, cost, createdAt, updatedAt)
    {
        Ingredients = ingredients ?? throw new ArgumentNullException(nameof(ingredients));
        ImagePath = imagePath;
        Course = course ?? throw new ArgumentNullException(nameof(course));
        Difficulty = difficulty;
        Speed = speed;
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
        UpdatedAt = DateTime.UtcNow;
    }

    public static implicit operator Meal(MealDocument doc)
    {
        var ingredients = doc.Ingredients
            .Select(ingredient =>
            {
                if (ingredient.IsString)
                {
                    return new MealIngredient(ingredient.AsString, null);
                }

                if (!ingredient.IsBsonDocument)
                {
                    return null;
                }

                var ingredientDoc = ingredient.AsBsonDocument;
                if (!ingredientDoc.TryGetValue("name", out var nameValue) || !nameValue.IsString)
                {
                    return null;
                }

                var macro = ingredientDoc.TryGetValue("macro", out var macroValue) && macroValue.IsString
                    ? macroValue.AsString
                    : null;

                return new MealIngredient(nameValue.AsString, macro);
            })
            .Where(ingredient => ingredient != null)
            .Cast<MealIngredient>()
            .ToList();

        return new Meal(
            id: doc.Id,
            name: doc.Name,
            rating: doc.Rating,
            isHealthyOption: doc.IsHealthyOption,
            cost: doc.Cost,
            ingredients: ingredients,
            course: doc.Course,
            difficulty: doc.Difficulty,
            speed: doc.Speed,
            createdAt: doc.CreatedAt,
            updatedAt: doc.UpdatedAt,
            imagePath: doc.ImagePath
        );
    }
}
