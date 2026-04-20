using FoodAndDrinkDomain.DTOs;
using FoodAndDrinkDomain.Exceptions;
using FoodAndDrinkDomain.Models;
using FoodAndDrinkRepository.Repositories;
using FoodAndDrinkService.Services;
using NSubstitute;
using Xunit;

namespace FoodAndDrinkApi.Tests.Services;

public class IngredientServiceTests
{
    private readonly IIngredientRepository _repository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IUserGroupRepository _userGroupRepository;
    private readonly IngredientService _service;

    public IngredientServiceTests()
    {
        _repository = Substitute.For<IIngredientRepository>();
        _inventoryRepository = Substitute.For<IInventoryRepository>();
        _userGroupRepository = Substitute.For<IUserGroupRepository>();
        _service = new IngredientService(_repository, _inventoryRepository, _userGroupRepository);
    }

    [Fact]
    public async Task AddIngredient_ForwardsToRepository()
    {
        var ingredient = new Ingredient("i1", "Egg", 8, true, 1, "Protein", null, DateTime.UtcNow);

        await _service.AddIngredient(ingredient);

        await _repository.Received(1).AddIngredient(ingredient);
    }

    [Fact]
    public async Task UpdateIngredient_WhenNoUpdates_Throws()
    {
        var update = new IngredientUpdateDetails { Id = "i1" };

        await Assert.ThrowsAsync<IngredientNoUpdatesDetectedException>(() => _service.UpdateIngredient(update, null));
        await _repository.DidNotReceive().UpdateIngredient(Arg.Any<IngredientUpdateDetails>());
    }

    [Fact]
    public async Task UpdateIngredient_WithPartialUpdate_ForwardsToRepository()
    {
        var update = new IngredientUpdateDetails
        {
            Id = "i1",
            Name = "Egg Whites",
        };

        await _service.UpdateIngredient(update, null);

        await _repository.Received(1).UpdateIngredient(Arg.Is<IngredientUpdateDetails>(u =>
            u.Id == update.Id &&
            u.Name == update.Name));
    }
}
