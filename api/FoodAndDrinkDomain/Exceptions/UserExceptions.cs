namespace FoodAndDrinkDomain.Exceptions;

public class UserNotFoundException(string id) : Exception($"User with Id {id} not found.");
