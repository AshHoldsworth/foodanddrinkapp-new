namespace FoodAndDrinkDomain.Configuration;

public class MongoDbConfiguration
{
    public required string ConnectionString { get; init; }
    public required string DatabaseName { get; init; }
    public required string MealCollection { get; init; }
    public required string IngredientCollection { get; init; }
    public required string DrinkCollection { get; init; }
    public string? InventoryCollection { get; init; }
    public string? UserGroupCollection { get; init; }
    public string? MealPlanCollection { get; init; }
    public string? ShoppingListCollection { get; init; }
    public string? UserCollection { get; init; }
}