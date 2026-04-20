using FoodAndDrinkDomain.Models;

namespace FoodAndDrinkDomain.Entities;

public class MealPlanDayDocument
{
    public DateTime Date { get; init; }
    public string? LunchMealId { get; init; }
    public string? DinnerMealId { get; init; }

    public static implicit operator MealPlanDayDocument(MealPlanDay model)
    {
        return new MealPlanDayDocument
        {
            Date = model.Date,
            LunchMealId = model.LunchMealId,
            DinnerMealId = model.DinnerMealId,
        };
    }
}