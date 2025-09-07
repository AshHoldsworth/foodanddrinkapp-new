namespace FoodAndDrinkDomain.Models;

public class BaseConsumable
{
    public string Id { get; init; }
    public string Name { get; init; }
    public int Rating { get; init; }
    public bool IsHealthyOption { get; init; }
    public int Cost { get; init; }

    protected BaseConsumable(string id, string name, int rating, bool isHealthyOption, int cost)
    {
        Id = id ?? throw new ArgumentNullException(nameof(id));
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Rating = rating;
        IsHealthyOption = isHealthyOption;
        Cost = cost;
    }

    protected BaseConsumable()
    {
        if (Id == null) throw new ArgumentNullException(nameof(Id));
        if (Name == null) throw new ArgumentNullException(nameof(Name));
        if (Rating == 0) throw new ArgumentNullException(nameof(Rating));
        if (Cost == 0) throw new ArgumentNullException(nameof(Cost));
    }
}