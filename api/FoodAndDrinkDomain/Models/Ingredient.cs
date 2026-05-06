namespace FoodAndDrinkDomain.Models;

public class Ingredient : BaseConsumable
{
    public string Macro { get; init; }
    public int StockQuantity { get; init; }
    public List<string>? Barcodes { get; init; }


    public string? CreatedBy { get; init; }
    public string? UpdatedBy { get; init; }

    public Ingredient(string id, string name, int rating, bool isHealthyOption, int cost, string macro, List<string>? barcodes, DateTime createdAt, DateTime? updatedAt = null, int stockQuantity = 0, string? createdBy = null, string? updatedBy = null)
        : base(id, name, rating, isHealthyOption, cost, createdAt, updatedAt)
    {
        Macro = macro ?? throw new ArgumentNullException(nameof(macro));
        StockQuantity = stockQuantity;
        Barcodes = barcodes;
        CreatedBy = createdBy;
        UpdatedBy = updatedBy;
    }
}
