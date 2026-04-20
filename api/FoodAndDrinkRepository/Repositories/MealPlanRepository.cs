using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IMealPlanRepository
{
    Task<MealPlan?> GetByWeekStart(string groupId, DateTime weekStart);
    Task UpsertMealPlan(MealPlan mealPlan);
}

public class MealPlanRepository : IMealPlanRepository
{
    private readonly IMongoCollection<MealPlanDocument> _collection;

    public MealPlanRepository(IMongoCollection<MealPlanDocument> collection)
    {
        _collection = collection;
    }

    public async Task<MealPlan?> GetByWeekStart(string groupId, DateTime weekStart)
    {
        var fb = Builders<MealPlanDocument>.Filter;
        var filter = fb.And(
            fb.Eq(plan => plan.GroupId, groupId),
            fb.Eq(plan => plan.WeekStart, weekStart)
        );
        var document = await _collection.Find(filter).FirstOrDefaultAsync();

        return document == null ? null : (MealPlan)document;
    }

    public async Task UpsertMealPlan(MealPlan mealPlan)
    {
        var fb = Builders<MealPlanDocument>.Filter;
        var filter = fb.And(
            fb.Eq(plan => plan.GroupId, mealPlan.GroupId),
            fb.Eq(plan => plan.WeekStart, mealPlan.WeekStart)
        );

        await _collection.ReplaceOneAsync(
            filter,
            mealPlan,
            new ReplaceOptions { IsUpsert = true });
    }
}
