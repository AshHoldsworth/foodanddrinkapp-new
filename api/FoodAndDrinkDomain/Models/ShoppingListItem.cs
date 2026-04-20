using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class ShoppingListItem
{
    public string IngredientId { get; private set; }
    public string IngredientName { get; private set; }
    public int Quantity { get; private set; }
    public bool IsPurchased { get; private set; }
    public DateTime? PurchasedAt { get; private set; }

    public ShoppingListItem(
        string ingredientId,
        string ingredientName,
        int quantity,
        bool isPurchased = false,
        DateTime? purchasedAt = null)
    {
        IngredientId = ingredientId;
        IngredientName = ingredientName;
        Quantity = quantity;
        IsPurchased = isPurchased;
        PurchasedAt = purchasedAt;
    }

    public void SetPurchased(bool isPurchased)
    {
        IsPurchased = isPurchased;
        PurchasedAt = isPurchased ? DateTime.UtcNow : null;
    }

    public static implicit operator ShoppingListItem(ShoppingListItemDocument doc)
    {
        return new ShoppingListItem(
            ingredientId: doc.IngredientId,
            ingredientName: doc.IngredientName,
            quantity: doc.Quantity,
            isPurchased: doc.IsPurchased,
            purchasedAt: doc.PurchasedAt
        );
    }
}
