namespace FoodAndDrinkDomain.Models;

public class ShoppingListItem
{
    private const string DefaultUoM = "Portions";

    public string IngredientId { get; private set; }
    public string IngredientName { get; private set; }
    public int Quantity { get; private set; }
    public string UoM { get; private set; }
    public bool IsPurchased { get; private set; }
    public DateTime? PurchasedAt { get; private set; }

    public ShoppingListItem(
        string ingredientId,
        string ingredientName,
        int quantity,
        string uoM,
        bool isPurchased = false,
        DateTime? purchasedAt = null)
    {
        IngredientId = ingredientId;
        IngredientName = ingredientName;
        Quantity = quantity;
        UoM = string.IsNullOrWhiteSpace(uoM) ? DefaultUoM : uoM;
        IsPurchased = isPurchased;
        PurchasedAt = purchasedAt;
    }

    public void SetPurchased(bool isPurchased)
    {
        IsPurchased = isPurchased;
        PurchasedAt = isPurchased ? DateTime.UtcNow : null;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity < 0)
            throw new ArgumentException("Quantity cannot be negative.");

        Quantity = quantity;
    }
}
