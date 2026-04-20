using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using MongoDB.Bson;

namespace FoodAndDrinkService.Services;

public interface IMealPlanService
{
    Task<MealPlan> GetWeekPlan(string userId, string groupId, DateTime weekStart);
    Task<MealPlan> SaveWeekPlan(string userId, string groupId, DateTime weekStart, List<MealPlanDay> days);
}

public class MealPlanService : IMealPlanService
{
    private readonly IMealPlanRepository _mealPlanRepository;
    private readonly IMealRepository _mealRepository;

    public MealPlanService(IMealPlanRepository mealPlanRepository, IMealRepository mealRepository)
    {
        _mealPlanRepository = mealPlanRepository;
        _mealRepository = mealRepository;
    }

    public async Task<MealPlan> GetWeekPlan(string userId, string groupId, DateTime weekStart)
    {
        var normalizedWeekStart = GetWeekStart(weekStart);
        var existingPlan = await _mealPlanRepository.GetByWeekStart(groupId, normalizedWeekStart);

        return existingPlan ?? CreateEmptyPlan(groupId, normalizedWeekStart);
    }

    public async Task<MealPlan> SaveWeekPlan(string userId, string groupId, DateTime weekStart, List<MealPlanDay> days)
    {
        var normalizedWeekStart = GetWeekStart(weekStart);
        var normalizedDays = NormalizeDays(normalizedWeekStart, days);
        var currentWeekStart = GetWeekStart(DateTime.UtcNow);

        if (normalizedWeekStart < currentWeekStart)
            throw new ArgumentException("Previous weeks cannot be edited.");

        await ValidateMealIds(normalizedDays);

        var existingPlan = await _mealPlanRepository.GetByWeekStart(groupId, normalizedWeekStart);

        ValidatePastDays(normalizedWeekStart, normalizedDays, existingPlan);

        if (existingPlan == null)
        {
            existingPlan = new MealPlan(
                id: ObjectId.GenerateNewId().ToString(),
                groupId: groupId,
                weekStart: normalizedWeekStart,
                days: normalizedDays,
                createdAt: DateTime.UtcNow,
                lastModifiedBy: userId,
                lastModifiedAt: DateTime.UtcNow);
        }
        else
        {
            existingPlan.UpdateDays(normalizedDays, userId);
        }

        await _mealPlanRepository.UpsertMealPlan(existingPlan);

        return existingPlan;
    }

    private static MealPlan CreateEmptyPlan(string groupId, DateTime weekStart)
    {
        return new MealPlan(
            id: ObjectId.GenerateNewId().ToString(),
            groupId: groupId,
            weekStart: weekStart,
            days: Enumerable.Range(0, 7)
                .Select(index => new MealPlanDay(weekStart.AddDays(index), null, null))
                .ToList(),
            createdAt: DateTime.UtcNow);
    }

    private async Task ValidateMealIds(List<MealPlanDay> days)
    {
        var selectedMealIds = days
            .SelectMany(day => new[] { day.LunchMealId, day.DinnerMealId })
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id!)
            .Distinct()
            .ToList();

        if (selectedMealIds.Count == 0)
            return;

        var existingMealIds = await _mealRepository.GetExistingMealIds(selectedMealIds);

        if (selectedMealIds.Any(id => !existingMealIds.Contains(id)))
            throw new ArgumentException("Meal plan contains meals that do not exist.");
    }

    private static void ValidatePastDays(DateTime weekStart, List<MealPlanDay> requestedDays, MealPlan? existingPlan)
    {
        var today = NormalizeDate(DateTime.UtcNow);

        if (weekStart > GetWeekStart(today))
            return;

        var existingDaysByDate = (existingPlan?.Days ?? [])
            .ToDictionary(day => day.Date, day => day);

        foreach (var day in requestedDays.Where(day => day.Date < today))
        {
            existingDaysByDate.TryGetValue(day.Date, out var existingDay);

            var existingLunchMealId = existingDay?.LunchMealId;
            var existingDinnerMealId = existingDay?.DinnerMealId;

            if (!string.Equals(day.LunchMealId, existingLunchMealId, StringComparison.Ordinal) ||
                !string.Equals(day.DinnerMealId, existingDinnerMealId, StringComparison.Ordinal))
            {
                throw new ArgumentException("Previous days cannot be edited.");
            }
        }
    }

    private static List<MealPlanDay> NormalizeDays(DateTime weekStart, List<MealPlanDay> days)
    {
        if (days.Count != 7)
            throw new ArgumentException("Meal plan must include exactly seven days.");

        var normalizedDays = days
            .Select(day => new MealPlanDay(
                date: NormalizeDate(day.Date),
                lunchMealId: NormalizeMealId(day.LunchMealId),
                dinnerMealId: NormalizeMealId(day.DinnerMealId)))
            .OrderBy(day => day.Date)
            .ToList();

        var duplicateDates = normalizedDays
            .GroupBy(day => day.Date)
            .Any(group => group.Count() > 1);

        if (duplicateDates)
            throw new ArgumentException("Meal plan contains duplicate days.");

        var expectedDates = Enumerable.Range(0, 7)
            .Select(index => weekStart.AddDays(index))
            .ToList();

        if (!normalizedDays.Select(day => day.Date).SequenceEqual(expectedDates))
            throw new ArgumentException("Meal plan days must match the selected week.");

        return normalizedDays;
    }

    private static string? NormalizeMealId(string? mealId)
    {
        return string.IsNullOrWhiteSpace(mealId) ? null : mealId.Trim();
    }

    private static DateTime GetWeekStart(DateTime date)
    {
        var normalizedDate = NormalizeDate(date);
        var daysSinceMonday = ((int)normalizedDate.DayOfWeek + 6) % 7;

        return normalizedDate.AddDays(-daysSinceMonday);
    }

    private static DateTime NormalizeDate(DateTime date)
    {
        var utcDate = date.Kind switch
        {
            DateTimeKind.Utc => date,
            DateTimeKind.Local => date.ToUniversalTime(),
            _ => DateTime.SpecifyKind(date, DateTimeKind.Utc),
        };

        return DateTime.SpecifyKind(utcDate.Date, DateTimeKind.Utc);
    }
}
