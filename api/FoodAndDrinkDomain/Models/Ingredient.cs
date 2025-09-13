using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class Ingredient : BaseConsumable
{
    public string Macro { get; init; }
    public List<string>? Barcodes { get; init; }

    public Ingredient(string id, string name, int rating, bool isHealthyOption, int cost, string macro, List<string>? barcodes, DateTime createdAt, DateTime? updatedAt = null)
        : base(id, name, rating, isHealthyOption, cost, createdAt, updatedAt)
    {
        Macro = macro ?? throw new ArgumentNullException(nameof(macro));
        Barcodes = barcodes;
    }

    public static implicit operator Ingredient(IngredientDocument doc)
    {
        return new Ingredient(
            id: doc.Id,
            name: doc.Name,
            rating: doc.Rating,
            isHealthyOption: doc.IsHealthyOption,
            cost: doc.Cost,
            macro: doc.Macro,
            barcodes: doc.Barcodes,
            createdAt: doc.CreatedAt,
            updatedAt: doc.UpdatedAt
        );
    }
}