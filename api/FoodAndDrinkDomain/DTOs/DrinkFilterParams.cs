namespace FoodAndDrinkDomain.DTOs;

public class DrinkFilterParams
{
    public string? Search { get; set; }
    public bool? IsHealthy { get; set; }
    public bool? NewOrUpdated { get; set; }
}
