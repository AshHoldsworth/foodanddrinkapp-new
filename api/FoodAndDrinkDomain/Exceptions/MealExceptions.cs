namespace FoodAndDrinkDomain.Exceptions;

public class NoMealsFoundException() : Exception("No meals found.");
public class MealNotFoundException(string id) : Exception($"Meal with Id {id} not found.");
public class MealAlreadyExistsException(string name) : Exception($"Meal with name {name} already exists.");
public class MealNoUpdatesDetectedException() : Exception("At least one field must be updated.");
public class MealIdIsNullException() : Exception("Must provide a Meal Id.");