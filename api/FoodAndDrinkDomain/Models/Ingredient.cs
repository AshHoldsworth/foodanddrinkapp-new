using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class Ingredient : BaseConsumable
{
    public string Macro { get; init; }
    public List<string>? Barcodes { get; init; }

    public Ingredient(string id, string name, int rating, bool isHealthyOption, int cost, string macro, List<string>? barcodes)
        : base(id, name, rating, isHealthyOption, cost)
    {
        Macro = macro ?? throw new ArgumentNullException(nameof(macro));
        Barcodes = barcodes;
    }

    private Ingredient()
    {
        if (Macro == null) throw new ArgumentNullException(nameof(Macro));
    }

    public static implicit operator Ingredient(IngredientDocument doc)
    {
        return new Ingredient
        {
            Id = doc.Id,
            Name = doc.Name,
            Rating = doc.Rating,
            IsHealthyOption = doc.IsHealthyOption,
            Cost = doc.Cost,
            Macro = doc.Macro,
            Barcodes = doc.Barcodes,
        };
    }
}