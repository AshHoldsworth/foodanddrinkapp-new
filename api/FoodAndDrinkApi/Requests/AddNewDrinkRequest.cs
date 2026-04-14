namespace FoodAndDrinkApi.Requests;

public class AddNewDrinkRequest
{
    public required string Name { get; init; }
    public IFormFile? Image { get; init; }
    public int Rating { get; init; }
    public bool IsHealthyOption { get; init; }
    public int Cost { get; init; }
    public required List<string> Ingredients { get; init; }
    public int Difficulty { get; init; }
    public int Speed { get; init; }
}