namespace FoodAndDrinkApi.Requests;

public class AddShoppingListItemRequest
{
    public required string ShoppingListId { get; set; }
    public required string IngredientId { get; set; }
    public required string IngredientName { get; set; }
    public required int Quantity { get; set; }
}
