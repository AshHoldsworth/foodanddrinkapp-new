namespace FoodAndDrinkDomain.DTOs;

public class IngredientFilterParams
{
    public string? Search { get; set; }
    public bool? IsHealthy { get; set; }
    public string? Macro { get; set; }
    public bool? InStockOnly { get; set; }
}
