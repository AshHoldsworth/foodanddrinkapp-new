using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class MealPlan
{
    public string Id { get; private set; }
    public string GroupId { get; private set; }
    public DateTime WeekStart { get; private set; }
    public List<MealPlanDay> Days { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public string? LastModifiedBy { get; private set; }
    public DateTime? LastModifiedAt { get; private set; }

    public MealPlan(
        string id,
        string groupId,
        DateTime weekStart,
        List<MealPlanDay> days,
        DateTime createdAt,
        string? lastModifiedBy = null,
        DateTime? lastModifiedAt = null)
    {
        Id = id;
        GroupId = groupId;
        WeekStart = weekStart;
        Days = days;
        CreatedAt = createdAt;
        LastModifiedBy = lastModifiedBy;
        LastModifiedAt = lastModifiedAt;
    }

    public void UpdateDays(List<MealPlanDay> days, string modifiedBy)
    {
        Days = days;
        LastModifiedBy = modifiedBy;
        LastModifiedAt = DateTime.UtcNow;
    }

    public static implicit operator MealPlan(MealPlanDocument doc)
    {
        return new MealPlan(
            id: doc.Id,
            groupId: doc.GroupId,
            weekStart: doc.WeekStart,
            days: doc.Days.Select(day => (MealPlanDay)day).ToList(),
            createdAt: doc.CreatedAt,
            lastModifiedBy: doc.LastModifiedBy,
            lastModifiedAt: doc.LastModifiedAt
        );
    }
}
