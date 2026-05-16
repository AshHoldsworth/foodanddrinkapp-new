using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using Microsoft.Extensions.Logging;

namespace FoodAndDrinkService.Services;

public interface IAuthService
{
    Task<List<User>> GetAllUsers();
    Task<List<UserGroup>> GetAllUserGroups();
    Task<UserGroup> CreateUserGroup(string name, string? createdBy = null);
    Task<bool> HasAnyUsers();
    Task<User> UpdateUser(string id, string username, string role, string? groupId);
    Task DeleteUser(string id);
    Task EnsureAdminUserFromEnvironment();
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUserGroupRepository _userGroupRepository;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserRepository userRepository, IUserGroupRepository userGroupRepository, ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _userGroupRepository = userGroupRepository;
        _logger = logger;
    }

    public async Task<List<User>> GetAllUsers()
    {
        return await _userRepository.GetAllUsers();
    }

    public async Task<List<UserGroup>> GetAllUserGroups()
    {
        return await _userGroupRepository.GetAll();
    }

    public async Task<UserGroup> CreateUserGroup(string name, string? createdBy = null)
    {
        var normalizedName = NormalizeGroupName(name);

        var existing = await _userGroupRepository.GetByName(normalizedName);
        if (existing != null)
            throw new ArgumentException("User group already exists.");

        var group = new UserGroup(
            id: Guid.NewGuid().ToString(),
            name: normalizedName,
            createdAt: DateTime.UtcNow,
            createdBy: createdBy);

        await _userGroupRepository.Add(group);

        return group;
    }

    public async Task<bool> HasAnyUsers()
    {
        return await _userRepository.AnyUsers();
    }

    public async Task<User> UpdateUser(string id, string username, string role, string? groupId)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("User id is required.");

        var existingUser = await _userRepository.GetById(id);
        var normalizedUsername = NormalizeUsername(username);
        var normalizedRole = NormalizeRole(role);
        var groupReference = await NormalizeGroupReference(groupId);

        var userWithSameUsername = await _userRepository.GetByUsername(normalizedUsername);
        if (userWithSameUsername != null && userWithSameUsername.Id != id)
            throw new ArgumentException("Username already exists.");

        var updatedUser = existingUser.WithProfile(
            normalizedUsername,
            normalizedRole,
            groupReference.groupId,
            groupReference.groupName);
        await _userRepository.UpdateUser(updatedUser);

        return updatedUser;
    }

    public async Task DeleteUser(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("User id is required.");

        await _userRepository.DeleteUser(id);
    }

    public async Task EnsureAdminUserFromEnvironment()
    {
        var adminUsername = Environment.GetEnvironmentVariable("ADMIN_USERNAME");

        if (string.IsNullOrWhiteSpace(adminUsername))
        {
            _logger.LogInformation("Admin seeding skipped: ADMIN_USERNAME is not set.");
            return;
        }

        var normalizedUsername = adminUsername.Trim().ToLowerInvariant();
        var existingUser = await _userRepository.GetByUsername(normalizedUsername);

        if (existingUser != null)
        {
            _logger.LogInformation("Admin user '{Username}' already exists, skipping seeding.", normalizedUsername);
            return;
        }

        var user = new User(
            id: Guid.NewGuid().ToString(),
            username: normalizedUsername,
            role: "admin",
            createdAt: DateTime.UtcNow,
            createdBy: normalizedUsername,
            groupId: null,
            groupName: null
        );

        await _userRepository.AddUser(user);
        _logger.LogInformation("Admin user '{Username}' created from environment variables.", normalizedUsername);
    }

    private static string NormalizeUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("Username is required.");

        return username.Trim().ToLowerInvariant();
    }

    private static string NormalizeRole(string role)
    {
        var normalizedRole = string.IsNullOrWhiteSpace(role) ? "user" : role.Trim().ToLowerInvariant();

        if (normalizedRole != "admin" && normalizedRole != "user")
            throw new ArgumentException("Role must be either 'admin' or 'user'.");

        return normalizedRole;
    }

    private async Task<(string? groupId, string? groupName)> NormalizeGroupReference(string? groupId)
    {
        if (string.IsNullOrWhiteSpace(groupId))
            return (null, null);

        var normalizedGroupId = groupId.Trim();
        var group = await _userGroupRepository.GetById(normalizedGroupId);

        if (group == null)
            throw new ArgumentException("Selected user group does not exist.");

        return (normalizedGroupId, group.Name);
    }

    private static string NormalizeGroupName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Group name is required.");

        return name.Trim();
    }
}
