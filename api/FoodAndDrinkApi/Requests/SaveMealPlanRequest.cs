namespace FoodAndDrinkApi.Requests;

public class SaveMealPlanRequest
{
    public DateTime WeekStart { get; set; }
    public List<SaveMealPlanDayRequest> Days { get; set; } = [];
}

public class SaveMealPlanDayRequest
{
    public DateTime Date { get; set; }
    public string? LunchMealId { get; set; }
    public string? DinnerMealId { get; set; }
}