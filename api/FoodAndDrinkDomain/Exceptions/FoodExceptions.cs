namespace FoodAndDrinkDomain.Exceptions;

public class NoFoodsFoundException() : Exception("No foods found.");
public class FoodNotFoundException(string id) : Exception($"Food with Id {id} not found.");
public class FoodAlreadyExistsException(string name) : Exception($"Food with name {name} already exists.");
public class FoodNoUpdatesDetectedException() : Exception("At least one field must be updated.");
public class FoodIdIsNullException() : Exception("Must provide a Food Id.");