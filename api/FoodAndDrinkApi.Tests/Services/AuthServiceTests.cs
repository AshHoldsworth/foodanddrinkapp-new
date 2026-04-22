using System.Security.Cryptography;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using FoodAndDrinkService.Services;
using NSubstitute;
using Xunit;
using Microsoft.Extensions.Logging;

namespace FoodAndDrinkApi.Tests.Services;

public class AuthServiceTests
{
    private readonly IUserRepository _repository;
    private readonly IUserGroupRepository _groupRepository;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _repository = Substitute.For<IUserRepository>();
        _groupRepository = Substitute.For<IUserGroupRepository>();
        _service = new AuthService(_repository, _groupRepository, Substitute.For<ILogger<AuthService>>());
    }

    [Fact]
    public async Task UpdateUser_UpdatesUsernameAndRole()
    {
        var existingUser = new User(
            id: "user-1",
            username: "existing",
            role: "user",
            passwordHash: "hash",
            passwordSalt: "salt",
            createdAt: DateTime.UtcNow);

        _repository.GetById("user-1").Returns(Task.FromResult(existingUser));
        _repository.GetByUsername("updated").Returns(Task.FromResult<User?>(null));

        var result = await _service.UpdateUser("user-1", "Updated", "admin", null);

        Assert.Equal("updated", result.Username);
        Assert.Equal("admin", result.Role);
        await _repository.Received(1).UpdateUser(Arg.Is<User>(user =>
            user.Id == "user-1"
            && user.Username == "updated"
            && user.Role == "admin"
            && user.PasswordHash == "hash"
            && user.PasswordSalt == "salt"));
    }

    [Fact]
    public async Task UpdateUser_WhenUsernameAlreadyExists_ThrowsArgumentException()
    {
        var existingUser = new User(
            id: "user-1",
            username: "existing",
            role: "user",
            passwordHash: "hash",
            passwordSalt: "salt",
            createdAt: DateTime.UtcNow);
        var conflictingUser = new User(
            id: "user-2",
            username: "taken",
            role: "user",
            passwordHash: "hash-2",
            passwordSalt: "salt-2",
            createdAt: DateTime.UtcNow);

        _repository.GetById("user-1").Returns(Task.FromResult(existingUser));
        _repository.GetByUsername("taken").Returns(Task.FromResult<User?>(conflictingUser));

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateUser("user-1", "taken", "user", null));

        Assert.Equal("Username already exists.", ex.Message);
        await _repository.DidNotReceive().UpdateUser(Arg.Any<User>());
    }

    [Fact]
    public async Task ChangePassword_WhenCurrentPasswordMatches_PersistsNewCredentials()
    {
        var (hash, salt) = CreatePassword("current-password");
        var existingUser = new User(
            id: "user-1",
            username: "existing",
            role: "user",
            passwordHash: hash,
            passwordSalt: salt,
            createdAt: DateTime.UtcNow);

        _repository.GetById("user-1").Returns(Task.FromResult(existingUser));

        await _service.ChangePassword("user-1", "current-password", "next-password");

        await _repository.Received(1).UpdateUser(Arg.Is<User>(user =>
            user.Id == "user-1"
            && user.Username == "existing"
            && user.Role == "user"
            && user.PasswordHash != hash
            && user.PasswordSalt != salt));
    }

    [Fact]
    public async Task ChangePassword_WhenCurrentPasswordIsWrong_ThrowsArgumentException()
    {
        var (hash, salt) = CreatePassword("current-password");
        var existingUser = new User(
            id: "user-1",
            username: "existing",
            role: "user",
            passwordHash: hash,
            passwordSalt: salt,
            createdAt: DateTime.UtcNow);

        _repository.GetById("user-1").Returns(Task.FromResult(existingUser));

        var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
            _service.ChangePassword("user-1", "wrong-password", "next-password"));

        Assert.Equal("Current password is incorrect.", ex.Message);
        await _repository.DidNotReceive().UpdateUser(Arg.Any<User>());
    }

    private static (string hash, string salt) CreatePassword(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var hashBytes = Rfc2898DeriveBytes.Pbkdf2(
            password,
            saltBytes,
            100_000,
            HashAlgorithmName.SHA256,
            32);

        return (Convert.ToBase64String(hashBytes), Convert.ToBase64String(saltBytes));
    }
}
