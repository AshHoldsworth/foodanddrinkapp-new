using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Data;
using FoodAndDrinkRepository.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodAndDrinkRepository.Repositories;

public interface IMealPlanRepository
{
    Task<MealPlan?> GetByWeekStart(string groupId, DateTime weekStart);
    Task UpsertMealPlan(MealPlan mealPlan);
}

public class MealPlanRepository : IMealPlanRepository
{
    private readonly AppDbContext _db;

    public MealPlanRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<MealPlan?> GetByWeekStart(string groupId, DateTime weekStart)
    {
        if (!Guid.TryParse(groupId, out var groupGuid)) return null;

        var weekEnd = weekStart.AddDays(7);
        var entries = await _db.MealPlan
            .Where(e => e.UserGroupId == groupGuid && e.Date >= weekStart && e.Date < weekEnd)
            .ToListAsync();

        if (entries.Count == 0) return null;

        var group = await _db.UserGroups.FindAsync(groupGuid);

        return BuildMealPlan(groupGuid, group?.Name, weekStart, entries);
    }

    public async Task UpsertMealPlan(MealPlan mealPlan)
    {
        if (!Guid.TryParse(mealPlan.GroupId, out var groupGuid)) return;

        var weekEnd = mealPlan.WeekStart.AddDays(7);

        var existing = await _db.MealPlan
            .Where(e => e.UserGroupId == groupGuid && e.Date >= mealPlan.WeekStart && e.Date < weekEnd)
            .ToListAsync();

        _db.MealPlan.RemoveRange(existing);

        foreach (var day in mealPlan.Days)
        {
            var lunchGuid = day.LunchMealId != null && Guid.TryParse(day.LunchMealId, out var lg) ? lg : (Guid?)null;
            var dinnerGuid = day.DinnerMealId != null && Guid.TryParse(day.DinnerMealId, out var dg) ? dg : (Guid?)null;

            _db.MealPlan.Add(new MealPlanEntity
            {
                Date = day.Date,
                MealSlot = "Lunch",
                UserGroupId = groupGuid,
                MealId = lunchGuid,
            });
            _db.MealPlan.Add(new MealPlanEntity
            {
                Date = day.Date,
                MealSlot = "Dinner",
                UserGroupId = groupGuid,
                MealId = dinnerGuid,
            });
        }

        await _db.SaveChangesAsync();
    }

    private static MealPlan BuildMealPlan(Guid groupGuid, string? groupName, DateTime weekStart, List<MealPlanEntity> entries)
    {
        var dayMap = entries
            .GroupBy(e => e.Date.Date)
            .ToDictionary(g => g.Key, g => g.ToList());

        var days = Enumerable.Range(0, 7)
            .Select(i => weekStart.AddDays(i).Date)
            .Select(date =>
            {
                var slots = dayMap.TryGetValue(date, out var s) ? s : [];
                var lunch = slots.FirstOrDefault(e => e.MealSlot == "Lunch");
                var dinner = slots.FirstOrDefault(e => e.MealSlot == "Dinner");
                return new MealPlanDay(date, lunch?.MealId?.ToString(), dinner?.MealId?.ToString());
            })
            .ToList();

        return new MealPlan(
            id: $"{groupGuid}_{weekStart:yyyyMMdd}",
            groupId: groupGuid.ToString(),
            groupName: groupName,
            weekStart: weekStart,
            days: days,
            createdAt: DateTime.UtcNow);
    }
}
