namespace FoodAndDrinkRepository.Data.Entities;

public class UserEntity
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string Role { get; set; }
    public Guid? UserGroupId { get; set; }
    public UserGroupEntity? UserGroup { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
