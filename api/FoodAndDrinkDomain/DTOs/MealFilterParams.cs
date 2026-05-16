namespace FoodAndDrinkDomain.DTOs;

public class MealFilterParams
{
    public string? Search { get; set; }
    public bool? IsHealthy { get; set; }
    public bool? NewOrUpdated { get; set; }
}
