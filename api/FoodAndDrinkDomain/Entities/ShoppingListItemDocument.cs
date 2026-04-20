using FoodAndDrinkDomain.Models;

namespace FoodAndDrinkDomain.Entities;

public class ShoppingListItemDocument
{
    public required string IngredientId { get; init; }
    public required string IngredientName { get; init; }
    public int Quantity { get; init; }
    public bool IsPurchased { get; init; }
    public DateTime? PurchasedAt { get; init; }

    public static implicit operator ShoppingListItemDocument(ShoppingListItem model)
    {
        return new ShoppingListItemDocument
        {
            IngredientId = model.IngredientId,
            IngredientName = model.IngredientName,
            Quantity = model.Quantity,
            IsPurchased = model.IsPurchased,
            PurchasedAt = model.PurchasedAt,
        };
    }
}
