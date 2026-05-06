using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Data;
using FoodAndDrinkRepository.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodAndDrinkRepository.Repositories;

public interface IUserGroupRepository
{
    Task<UserGroup?> GetByName(string name);
    Task<UserGroup?> GetById(string id);
    Task<List<UserGroup>> GetAll();
    Task Add(UserGroup group);
}

public class UserGroupRepository : IUserGroupRepository
{
    private readonly AppDbContext _db;

    public UserGroupRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserGroup?> GetByName(string name)
    {
        var entity = await _db.UserGroups.FirstOrDefaultAsync(g => g.Name == name);
        return entity == null ? null : ToModel(entity);
    }

    public async Task<UserGroup?> GetById(string id)
    {
        if (!Guid.TryParse(id, out var guid)) return null;

        var entity = await _db.UserGroups.FindAsync(guid);
        return entity == null ? null : ToModel(entity);
    }

    public async Task<List<UserGroup>> GetAll()
    {
        var entities = await _db.UserGroups
            .OrderBy(g => g.Name)
            .ToListAsync();

        return entities.Select(ToModel).ToList();
    }

    public async Task Add(UserGroup group)
    {
        _db.UserGroups.Add(ToEntity(group));
        await _db.SaveChangesAsync();
    }

    private static UserGroup ToModel(UserGroupEntity entity)
    {
        return new UserGroup(
            id: entity.Id.ToString(),
            name: entity.Name,
            createdAt: entity.CreatedAt);
    }

    private static UserGroupEntity ToEntity(UserGroup group)
    {
        var id = Guid.TryParse(group.Id, out var guid) ? guid : Guid.NewGuid();
        return new UserGroupEntity
        {
            Id = id,
            Name = group.Name,
            CreatedAt = group.CreatedAt,
        };
    }
}
