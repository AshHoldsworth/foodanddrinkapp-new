using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class MealPlanDay
{
    public DateTime Date { get; private set; }
    public string? LunchMealId { get; private set; }
    public string? DinnerMealId { get; private set; }

    public MealPlanDay(DateTime date, string? lunchMealId, string? dinnerMealId)
    {
        Date = date;
        LunchMealId = lunchMealId;
        DinnerMealId = dinnerMealId;
    }

    public static implicit operator MealPlanDay(MealPlanDayDocument doc)
    {
        return new MealPlanDay(
            date: doc.Date,
            lunchMealId: doc.LunchMealId,
            dinnerMealId: doc.DinnerMealId
        );
    }
}
