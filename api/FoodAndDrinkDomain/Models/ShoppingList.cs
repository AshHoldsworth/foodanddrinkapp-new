using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class ShoppingList
{
    public string Id { get; private set; }
    public string GroupId { get; private set; }
    public string? GroupName { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public List<ShoppingListItem> Items { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CompletedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public string? LastModifiedBy { get; private set; }
    public DateTime? LastModifiedAt { get; private set; }

    public ShoppingList(
        string id,
        string groupId,
        string? groupName,
        DateTime startDate,
        DateTime endDate,
        List<ShoppingListItem> items,
        DateTime createdAt,
        bool isCompleted = false,
        DateTime? completedAt = null,
        string? completedBy = null,
        string? lastModifiedBy = null,
        DateTime? lastModifiedAt = null)
    {
        Id = id;
        GroupId = groupId;
        GroupName = groupName;
        StartDate = startDate;
        EndDate = endDate;
        Items = items;
        IsCompleted = isCompleted;
        CompletedAt = completedAt;
        CompletedBy = completedBy;
        CreatedAt = createdAt;
        LastModifiedBy = lastModifiedBy;
        LastModifiedAt = lastModifiedAt;
    }

    public void SetItemPurchased(string ingredientId, bool isPurchased, string modifiedBy)
    {
        var item = Items.FirstOrDefault(i => i.IngredientId == ingredientId)
            ?? throw new ArgumentException("Shopping list item not found.");

        item.SetPurchased(isPurchased);
        LastModifiedBy = modifiedBy;
        LastModifiedAt = DateTime.UtcNow;
    }

    public void Complete(string modifiedBy, string completedBy)
    {
        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
        CompletedBy = completedBy;
        LastModifiedBy = modifiedBy;
        LastModifiedAt = DateTime.UtcNow;
    }

    public void UpdateGroupName(string groupName)
    {
        GroupName = groupName;
    }

    public static implicit operator ShoppingList(ShoppingListDocument doc)
    {
        return new ShoppingList(
            id: doc.Id,
            groupId: doc.GroupId,
            groupName: doc.GroupName,
            startDate: doc.StartDate,
            endDate: doc.EndDate,
            items: doc.Items.Select(item => (ShoppingListItem)item).ToList(),
            createdAt: doc.CreatedAt,
            isCompleted: doc.IsCompleted,
            completedAt: doc.CompletedAt,
            completedBy: doc.CompletedBy,
            lastModifiedBy: doc.LastModifiedBy,
            lastModifiedAt: doc.LastModifiedAt
        );
    }
}
