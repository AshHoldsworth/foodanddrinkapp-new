namespace FoodAndDrinkDomain.DTOs;

public class DrinkFilterParams
{
    public string? Search { get; set; }
    public bool? IsHealthy { get; set; }
    public int? MaxCost { get; set; }
    public int? MaxRating { get; set; }
    public int? MaxSpeed { get; set; }
    public bool? NewOrUpdated { get; set; }
}