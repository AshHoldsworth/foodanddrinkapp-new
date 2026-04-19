using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using MongoDB.Driver;

namespace FoodAndDrinkRepository.Repositories;

public interface IUserRepository
{
    Task<User> GetById(string id);
    Task<User?> GetByUsername(string username);
    Task<List<User>> GetAllUsers();
    Task<bool> AnyUsers();
    Task AddUser(User user);
    Task UpdateUser(User user);
    Task DeleteUser(string id);
}

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<UserDocument> _collection;

    public UserRepository(IMongoCollection<UserDocument> collection)
    {
        _collection = collection;
    }

    public async Task<User> GetById(string id)
    {
        var filter = Builders<UserDocument>.Filter.Eq(user => user.Id, id);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();

        if (document == null) throw new UserNotFoundException(id);

        return (User)document;
    }

    public async Task<User?> GetByUsername(string username)
    {
        var filter = Builders<UserDocument>.Filter.Eq(user => user.Username, username);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();

        return document == null ? null : (User)document;
    }

    public async Task<List<User>> GetAllUsers()
    {
        var documents = await _collection.Find(Builders<UserDocument>.Filter.Empty).ToListAsync();
        return documents.Select(document => (User)document).ToList();
    }

    public async Task<bool> AnyUsers()
    {
        var count = await _collection.CountDocumentsAsync(Builders<UserDocument>.Filter.Empty);
        return count > 0;
    }

    public async Task AddUser(User user)
    {
        await _collection.InsertOneAsync(user);
    }

    public async Task UpdateUser(User user)
    {
        var filter = Builders<UserDocument>.Filter.Eq(existingUser => existingUser.Id, user.Id);
        var result = await _collection.ReplaceOneAsync(filter, user);

        if (result.MatchedCount == 0) throw new UserNotFoundException(user.Id);
    }

    public async Task DeleteUser(string id)
    {
        var filter = Builders<UserDocument>.Filter.Eq(user => user.Id, id);
        var result = await _collection.DeleteOneAsync(filter);

        if (result.DeletedCount == 0) throw new UserNotFoundException(id);
    }
}
