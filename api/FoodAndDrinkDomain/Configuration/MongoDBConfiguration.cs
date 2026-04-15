namespace FoodAndDrinkDomain.Configuration;

public class MongoDbConfiguration
{
    public required string ConnectionString { get; init; }
    public required string DatabaseName { get; init; }
    public required string MealCollection { get; init; }
    public required string IngredientCollection { get; init; }
    public required string DrinkCollection { get; init; }
}