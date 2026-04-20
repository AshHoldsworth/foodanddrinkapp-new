namespace FoodAndDrinkApi.Requests;

public class UpdateIngredientStockBatchRequest
{
    public List<IngredientStockUpdateItem> Items { get; set; } = [];
}

public class IngredientStockUpdateItem
{
    public string Id { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}
