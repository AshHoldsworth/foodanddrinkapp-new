namespace FoodAndDrinkApi.Requests;

public class UpdateShoppingListItemQuantityRequest
{
    public required string ShoppingListId { get; set; }
    public required string IngredientId { get; set; }
    public required int Quantity { get; set; }
}
