using System.Security.Cryptography;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using MongoDB.Bson;

namespace FoodAndDrinkService.Services;

public interface IAuthService
{
    Task<User?> ValidateCredentials(string username, string password);
    Task<List<User>> GetAllUsers();
    Task<bool> HasAnyUsers();
    Task<User> RegisterUser(string username, string password, string role);
    Task<User> UpdateUser(string id, string username, string role);
    Task DeleteUser(string id);
    Task ChangePassword(string id, string currentPassword, string newPassword);
    Task EnsureAdminUserFromEnvironment();
}

public class AuthService : IAuthService
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    private readonly IUserRepository _userRepository;

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> ValidateCredentials(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return null;

        var normalizedUsername = username.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByUsername(normalizedUsername);

        if (user == null) return null;

        return VerifyPassword(password, user.PasswordHash, user.PasswordSalt) ? user : null;
    }

    public async Task<List<User>> GetAllUsers()
    {
        return await _userRepository.GetAllUsers();
    }

    public async Task<bool> HasAnyUsers()
    {
        return await _userRepository.AnyUsers();
    }

    public async Task<User> RegisterUser(string username, string password, string role)
    {
        var normalizedUsername = NormalizeUsername(username);
        ValidatePassword(password, "Password is required.");
        var normalizedRole = NormalizeRole(role);

        var existingUser = await _userRepository.GetByUsername(normalizedUsername);
        if (existingUser != null) throw new ArgumentException("Username already exists.");

        var (hash, salt) = HashPassword(password);

        var user = new User(
            id: ObjectId.GenerateNewId().ToString(),
            username: normalizedUsername,
            role: normalizedRole,
            passwordHash: hash,
            passwordSalt: salt,
            createdAt: DateTime.UtcNow
        );

        await _userRepository.AddUser(user);

        return user;
    }

    public async Task<User> UpdateUser(string id, string username, string role)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("User id is required.");

        var existingUser = await _userRepository.GetById(id);
        var normalizedUsername = NormalizeUsername(username);
        var normalizedRole = NormalizeRole(role);

        var userWithSameUsername = await _userRepository.GetByUsername(normalizedUsername);
        if (userWithSameUsername != null && userWithSameUsername.Id != id)
            throw new ArgumentException("Username already exists.");

        var updatedUser = existingUser.WithProfile(normalizedUsername, normalizedRole);
        await _userRepository.UpdateUser(updatedUser);

        return updatedUser;
    }

    public async Task DeleteUser(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("User id is required.");

        await _userRepository.DeleteUser(id);
    }

    public async Task ChangePassword(string id, string currentPassword, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("User id is required.");
        ValidatePassword(currentPassword, "Current password is required.");
        ValidatePassword(newPassword, "New password is required.");

        var user = await _userRepository.GetById(id);

        if (!VerifyPassword(currentPassword, user.PasswordHash, user.PasswordSalt))
            throw new ArgumentException("Current password is incorrect.");

        var (hash, salt) = HashPassword(newPassword);
        var updatedUser = user.WithPassword(hash, salt);

        await _userRepository.UpdateUser(updatedUser);
    }

    public async Task EnsureAdminUserFromEnvironment()
    {
        var adminUsername = Environment.GetEnvironmentVariable("ADMIN_USERNAME");
        var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD");

        if (string.IsNullOrWhiteSpace(adminUsername) || string.IsNullOrWhiteSpace(adminPassword))
            return;

        var normalizedUsername = adminUsername.Trim().ToLowerInvariant();
        var existingUser = await _userRepository.GetByUsername(normalizedUsername);
        if (existingUser != null) return;

        var (hash, salt) = HashPassword(adminPassword);

        var user = new User(
            id: ObjectId.GenerateNewId().ToString(),
            username: normalizedUsername,
            role: "admin",
            passwordHash: hash,
            passwordSalt: salt,
            createdAt: DateTime.UtcNow
        );

        await _userRepository.AddUser(user);
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

    private static void ValidatePassword(string password, string requiredMessage)
    {
        if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException(requiredMessage);
    }

    private static (string hash, string salt) HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            HashSize);

        return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
    }

    private static bool VerifyPassword(string password, string expectedHash, string storedSalt)
    {
        var salt = Convert.FromBase64String(storedSalt);
        var computedHash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            HashSize);

        var expectedHashBytes = Convert.FromBase64String(expectedHash);
        return CryptographicOperations.FixedTimeEquals(computedHash, expectedHashBytes);
    }
}
