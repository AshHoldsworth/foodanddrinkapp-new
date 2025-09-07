using FoodAndDrinkDomain.Models;

namespace FoodAndDrinkApi.Requests;

public class AddNewFoodRequest
{
    public string Name { get; init; }
    public int Rating { get; init; }
    public bool IsHealthyOption { get; init; }
    public int Cost { get; init; }
    public List<Ingredient> Ingredients { get; init; }
    public string Course { get; init; }
    public int Difficulty { get; init; }
    public int Speed { get; init; }
}