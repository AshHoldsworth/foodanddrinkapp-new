namespace FoodAndDrinkDomain.Exceptions;

public class NoDrinksFoundException() : Exception("No drinks found.");
public class DrinkNotFoundException(string id) : Exception($"Drink with Id {id} not found.");
public class DrinkAlreadyExistsException(string name) : Exception($"Drink with name {name} already exists.");
