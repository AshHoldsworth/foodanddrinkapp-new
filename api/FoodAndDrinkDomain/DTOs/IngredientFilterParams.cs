namespace FoodAndDrinkDomain.DTOs;

public class IngredientFilterParams
{
    public string? Search { get; set; }
    public bool? IsHealthy { get; set; }
    public int? MaxCost { get; set; }
    public int? MaxRating { get; set; }
}