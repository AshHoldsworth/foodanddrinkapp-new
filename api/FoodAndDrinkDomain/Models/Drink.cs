namespace FoodAndDrinkDomain.Models;

public class Drink : BaseConsumable
{
    public List<Ingredient>? Ingredients { get; init; }

    public Drink(string id, string name, int rating, bool isHealthyOption, int cost, List<Ingredient>? ingredients)
        : base(id, name, rating, isHealthyOption, cost)
    {
        Ingredients = ingredients;
    }
}