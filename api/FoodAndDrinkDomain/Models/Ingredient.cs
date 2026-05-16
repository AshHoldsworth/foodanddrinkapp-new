namespace FoodAndDrinkDomain.Models;

public class Ingredient : BaseConsumable
{
    private const string DefaultUoM = "Portions";

    public string Macro { get; init; }
    public string UoM { get; init; }
    public int StockQuantity { get; init; }
    public List<string>? Barcodes { get; init; }


    public string? CreatedBy { get; init; }
    public string? UpdatedBy { get; init; }

    public Ingredient(string id, string name, bool isHealthyOption, string macro, List<string>? barcodes, DateTime createdAt, DateTime? updatedAt = null, int stockQuantity = 0, string uoM = DefaultUoM, string? createdBy = null, string? updatedBy = null)
        : base(id, name, isHealthyOption, createdAt, updatedAt)
    {
        Macro = macro ?? throw new ArgumentNullException(nameof(macro));
        UoM = string.IsNullOrWhiteSpace(uoM) ? DefaultUoM : uoM;
        StockQuantity = stockQuantity;
        Barcodes = barcodes;
        CreatedBy = createdBy;
        UpdatedBy = updatedBy;
    }
}
