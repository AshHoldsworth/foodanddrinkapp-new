namespace FoodAndDrinkDomain.Exceptions;

public class IngredientAlreadyExistsException(string name) : Exception($"Ingredient with name {name} already exists.");
public class IngredientNotFoundException(string id) : Exception($"Ingredient with Id {id} not found.");
public class IngredientNoUpdatesDetectedException() : Exception("At least one field must be updated.");
public class IngredientIdIsNullException() : Exception("Must provide an Ingredient Id.");
public class NoIngredientsFoundException() : Exception("No ingredients found.");