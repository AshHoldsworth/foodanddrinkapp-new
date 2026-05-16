namespace FoodAndDrinkDomain.Models;

public class Inventory
{
    public string Id { get; init; }
    public string GroupId { get; init; }
    public string? GroupName { get; init; }
    public List<InventoryProduct> Products { get; init; }
    public DateTime UpdatedAt { get; init; }

    public Inventory(
        string id,
        string groupId,
        string? groupName,
        List<InventoryProduct> products,
        DateTime updatedAt)
    {
        Id = id;
        GroupId = groupId;
        GroupName = groupName;
        Products = products;
        UpdatedAt = updatedAt;
    }
}

public class InventoryProduct
{
    public string IngredientId { get; init; }
    public string? IngredientName { get; init; }
    public int StockQuantity { get; init; }

    public InventoryProduct(string ingredientId, string? ingredientName, int stockQuantity)
    {
        IngredientId = ingredientId;
        IngredientName = ingredientName;
        StockQuantity = stockQuantity;
    }
}
