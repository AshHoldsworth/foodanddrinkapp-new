using FoodAndDrinkDomain.Entities;
using FoodAndDrinkDomain.Models;
using MongoDB.Driver;

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
    private readonly IMongoCollection<UserGroupDocument> _collection;

    public UserGroupRepository(IMongoCollection<UserGroupDocument> collection)
    {
        _collection = collection;
    }

    public async Task<UserGroup?> GetByName(string name)
    {
        var filter = Builders<UserGroupDocument>.Filter.Eq(item => item.Name, name);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();
        return document == null ? null : (UserGroup)document;
    }

    public async Task<UserGroup?> GetById(string id)
    {
        var filter = Builders<UserGroupDocument>.Filter.Eq(item => item.Id, id);
        var document = await _collection.Find(filter).FirstOrDefaultAsync();
        return document == null ? null : (UserGroup)document;
    }

    public async Task<List<UserGroup>> GetAll()
    {
        var documents = await _collection.Find(Builders<UserGroupDocument>.Filter.Empty)
            .SortBy(group => group.Name)
            .ToListAsync();

        return documents.Select(document => (UserGroup)document).ToList();
    }

    public async Task Add(UserGroup group)
    {
        await _collection.InsertOneAsync(group);
    }
}