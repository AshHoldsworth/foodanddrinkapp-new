using FoodAndDrinkDomain.Models;

namespace FoodAndDrinkApi.Requests;

public class AddNewFoodRequest
{
    public required string Name { get; init; }
    public int Rating { get; init; }
    public bool IsHealthyOption { get; init; }
    public int Cost { get; init; }
    public required List<string> Ingredients { get; init; }
    public required string Course { get; init; }
    public int Difficulty { get; init; }
    public int Speed { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }   
}