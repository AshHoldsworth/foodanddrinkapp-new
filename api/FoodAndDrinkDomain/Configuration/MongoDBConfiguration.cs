namespace FoodAndDrinkDomain;

public class MongoDbConfiguration
{
    public required string ConnectionString { get; init; }
    public required string DatabaseName { get; init; }
    public required string FoodCollection { get; init; }
    public required string IngredientCollection { get; init; }
}