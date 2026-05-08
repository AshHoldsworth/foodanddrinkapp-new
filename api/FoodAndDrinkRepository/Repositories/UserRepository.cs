using FoodAndDrinkDomain.Models;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkRepository.Data;
using FoodAndDrinkRepository.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodAndDrinkRepository.Repositories;

public interface IUserRepository
{
    Task<User> GetById(string id);
    Task<User?> TryGetById(string id);
    Task<User?> GetByUsername(string username);
    Task<List<User>> GetAllUsers();
    Task<bool> AnyUsers();
    Task AddUser(User user);
    Task UpdateUser(User user);
    Task DeleteUser(string id);
}

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User> GetById(string id)
    {
        var user = await TryGetById(id);
        if (user == null) throw new UserNotFoundException(id);
        return user;
    }

    public async Task<User?> TryGetById(string id)
    {
        if (!Guid.TryParse(id, out var guid)) return null;

        var entity = await _db.Users
            .Include(u => u.UserGroup)
            .FirstOrDefaultAsync(u => u.Id == guid);

        return entity == null ? null : ToModel(entity);
    }

    public async Task<User?> GetByUsername(string username)
    {
        var entity = await _db.Users
            .Include(u => u.UserGroup)
            .FirstOrDefaultAsync(u => u.Username == username);

        return entity == null ? null : ToModel(entity);
    }

    public async Task<List<User>> GetAllUsers()
    {
        var entities = await _db.Users
            .Include(u => u.UserGroup)
            .ToListAsync();

        return entities.Select(ToModel).ToList();
    }

    public async Task<bool> AnyUsers()
    {
        return await _db.Users.AnyAsync();
    }

    public async Task AddUser(User user)
    {
        _db.Users.Add(ToEntity(user));
        await _db.SaveChangesAsync();
    }

    public async Task UpdateUser(User user)
    {
        if (!Guid.TryParse(user.Id, out var guid)) throw new UserNotFoundException(user.Id);

        var entity = await _db.Users.FindAsync(guid);
        if (entity == null) throw new UserNotFoundException(user.Id);

        entity.Username = user.Username;
        entity.Role = user.Role;
        entity.PasswordHash = user.PasswordHash;
        entity.PasswordSalt = user.PasswordSalt;
        entity.UserGroupId = user.GroupId != null && Guid.TryParse(user.GroupId, out var groupGuid)
            ? groupGuid
            : null;

        await _db.SaveChangesAsync();
    }

    public async Task DeleteUser(string id)
    {
        if (!Guid.TryParse(id, out var guid)) throw new UserNotFoundException(id);

        var entity = await _db.Users.FindAsync(guid);
        if (entity == null) throw new UserNotFoundException(id);

        _db.Users.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private static User ToModel(UserEntity entity)
    {
        return new User(
            id: entity.Id.ToString(),
            username: entity.Username,
            role: entity.Role,
            passwordHash: entity.PasswordHash,
            passwordSalt: entity.PasswordSalt,
            createdAt: entity.CreatedAt,
            createdBy: entity.CreatedBy,
            groupId: entity.UserGroupId?.ToString(),
            groupName: entity.UserGroup?.Name);
    }

    private static UserEntity ToEntity(User user)
    {
        var id = Guid.TryParse(user.Id, out var guid) ? guid : Guid.NewGuid();
        return new UserEntity
        {
            Id = id,
            Username = user.Username,
            Role = user.Role,
            PasswordHash = user.PasswordHash,
            PasswordSalt = user.PasswordSalt,
            CreatedAt = user.CreatedAt,
            CreatedBy = user.CreatedBy,
            UserGroupId = user.GroupId != null && Guid.TryParse(user.GroupId, out var groupGuid)
                ? groupGuid
                : null,
        };
    }
}
