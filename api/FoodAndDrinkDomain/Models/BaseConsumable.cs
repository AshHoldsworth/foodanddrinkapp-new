namespace FoodAndDrinkDomain.Models;

public class BaseConsumable
{
    public string Id { get; init; }
    public string Name { get; protected set; }
    public int Rating { get; protected set; }
    public bool IsHealthyOption { get; protected set; }
    public int Cost { get; protected set; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; protected set; }

    protected BaseConsumable(string id, string name, int rating, bool isHealthyOption, int cost, DateTime createdAt, DateTime? updatedAt = null)
    {
        Id = id ?? throw new ArgumentNullException(nameof(id));
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Rating = rating;
        IsHealthyOption = isHealthyOption;
        Cost = cost;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
    }

    protected BaseConsumable()
    {
        if (Id == null) throw new ArgumentNullException(nameof(Id));
        if (Name == null) throw new ArgumentNullException(nameof(Name));
        if (Rating == 0) throw new ArgumentNullException(nameof(Rating));
        if (Cost == 0) throw new ArgumentNullException(nameof(Cost));
    }
}