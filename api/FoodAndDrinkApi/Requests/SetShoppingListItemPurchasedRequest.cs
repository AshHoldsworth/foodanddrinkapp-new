namespace FoodAndDrinkApi.Requests;

public class SetShoppingListItemPurchasedRequest
{
    public required string ShoppingListId { get; init; }
    public required string IngredientId { get; init; }
    public bool IsPurchased { get; init; }
}
