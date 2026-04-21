namespace FoodAndDrinkApi.Requests;

public class RemoveShoppingListItemRequest
{
    public required string ShoppingListId { get; set; }
    public required string IngredientId { get; set; }
}
