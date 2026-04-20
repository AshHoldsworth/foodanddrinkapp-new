using FoodAndDrinkDomain.Entities;

namespace FoodAndDrinkDomain.Models;

public class ShoppingList
{
    public string Id { get; private set; }
    public string GroupId { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public List<ShoppingListItem> Items { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public string? LastModifiedBy { get; private set; }
    public DateTime? LastModifiedAt { get; private set; }

    public ShoppingList(
        string id,
        string groupId,
        DateTime startDate,
        DateTime endDate,
        List<ShoppingListItem> items,
        DateTime createdAt,
        bool isCompleted = false,
        DateTime? completedAt = null,
        string? lastModifiedBy = null,
        DateTime? lastModifiedAt = null)
    {
        Id = id;
        GroupId = groupId;
        StartDate = startDate;
        EndDate = endDate;
        Items = items;
        IsCompleted = isCompleted;
        CompletedAt = completedAt;
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

    public void Complete(string modifiedBy)
    {
        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
        LastModifiedBy = modifiedBy;
        LastModifiedAt = DateTime.UtcNow;
    }

    public static implicit operator ShoppingList(ShoppingListDocument doc)
    {
        return new ShoppingList(
            id: doc.Id,
            groupId: doc.GroupId,
            startDate: doc.StartDate,
            endDate: doc.EndDate,
            items: doc.Items.Select(item => (ShoppingListItem)item).ToList(),
            createdAt: doc.CreatedAt,
            isCompleted: doc.IsCompleted,
            completedAt: doc.CompletedAt,
            lastModifiedBy: doc.LastModifiedBy,
            lastModifiedAt: doc.LastModifiedAt
        );
    }
}
