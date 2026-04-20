using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class Ingredient : BaseConsumable
{
    public string Macro { get; init; }
    public int StockQuantity { get; init; }
    public List<string>? Barcodes { get; init; }

    public Ingredient(string id, string name, int rating, bool isHealthyOption, int cost, string macro, List<string>? barcodes, DateTime createdAt, DateTime? updatedAt = null, int stockQuantity = 0)
        : base(id, name, rating, isHealthyOption, cost, createdAt, updatedAt)
    {
        Macro = macro ?? throw new ArgumentNullException(nameof(macro));
        StockQuantity = stockQuantity;
        Barcodes = barcodes;
    }

    public static implicit operator Ingredient(IngredientDocument doc)
    {
        var fallbackName = doc.Name ?? doc.LegacyName ?? string.Empty;
        var fallbackMacro = doc.Macro ?? doc.LegacyMacro ?? string.Empty;
        var fallbackRating = doc.Rating != 0 ? doc.Rating : (doc.LegacyRating ?? 0);
        var fallbackCost = doc.Cost != 0 ? doc.Cost : (doc.LegacyCost ?? 0);
        var fallbackIsHealthy = doc.IsHealthyOption || (doc.LegacyIsHealthyOption ?? false);
        var fallbackCreatedAt = doc.CreatedAt != default ? doc.CreatedAt : (doc.LegacyCreatedAt ?? DateTime.UtcNow);

        return new Ingredient(
            id: doc.Id,
            name: fallbackName,
            rating: fallbackRating,
            isHealthyOption: fallbackIsHealthy,
            cost: fallbackCost,
            macro: fallbackMacro,
            barcodes: doc.Barcodes ?? doc.LegacyBarcodes,
            createdAt: fallbackCreatedAt,
            updatedAt: doc.UpdatedAt ?? doc.LegacyUpdatedAt,
            stockQuantity: doc.StockQuantity != 0 ? doc.StockQuantity : (doc.LegacyStockQuantity ?? 0)
        );
    }
}