using FoodAndDrinkRepository.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodAndDrinkRepository.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<UserGroupEntity> UserGroups => Set<UserGroupEntity>();
    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<IngredientEntity> Ingredients => Set<IngredientEntity>();
    public DbSet<InventoryEntity> Inventory => Set<InventoryEntity>();
    public DbSet<MealEntity> Meals => Set<MealEntity>();
    public DbSet<MealIngredientEntity> MealIngredients => Set<MealIngredientEntity>();
    public DbSet<MealPlanEntity> MealPlan => Set<MealPlanEntity>();
    public DbSet<ShoppingListEntity> ShoppingLists => Set<ShoppingListEntity>();
    public DbSet<ShoppingListIngredientEntity> ShoppingListIngredients => Set<ShoppingListIngredientEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserGroupEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.HasIndex(e => e.Name).IsUnique();
            entity.ToTable("UserGroups");
        });

        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasOne(e => e.UserGroup)
                .WithMany(g => g.Users)
                .HasForeignKey(e => e.UserGroupId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.ToTable("Users");
        });

        modelBuilder.Entity<IngredientEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.HasIndex(e => e.Name).IsUnique();
            entity.ToTable("Ingredients");
        });

        modelBuilder.Entity<InventoryEntity>(entity =>
        {
            entity.HasKey(e => new { e.IngredientId, e.UserGroupId });
            entity.HasOne(e => e.Ingredient)
                .WithMany(i => i.Inventory)
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.UserGroup)
                .WithMany(g => g.Inventory)
                .HasForeignKey(e => e.UserGroupId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.ToTable("Inventory");
        });

        modelBuilder.Entity<MealEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("Meals");
        });

        modelBuilder.Entity<MealIngredientEntity>(entity =>
        {
            entity.HasKey(e => new { e.MealId, e.IngredientId });
            entity.HasOne(e => e.Meal)
                .WithMany(m => m.Ingredients)
                .HasForeignKey(e => e.MealId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Ingredient)
                .WithMany(i => i.MealIngredients)
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.ToTable("MealIngredients");
        });

        modelBuilder.Entity<MealPlanEntity>(entity =>
        {
            entity.HasKey(e => new { e.Date, e.MealSlot, e.UserGroupId });
            entity.HasOne(e => e.UserGroup)
                .WithMany(g => g.MealPlanEntries)
                .HasForeignKey(e => e.UserGroupId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Meal)
                .WithMany(m => m.MealPlanEntries)
                .HasForeignKey(e => e.MealId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.ToTable("MealPlan");
        });

        modelBuilder.Entity<ShoppingListEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.HasOne(e => e.UserGroup)
                .WithMany(g => g.ShoppingLists)
                .HasForeignKey(e => e.UserGroupId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.ToTable("ShoppingLists");
        });

        modelBuilder.Entity<ShoppingListIngredientEntity>(entity =>
        {
            entity.HasKey(e => new { e.ShoppingListId, e.IngredientId });
            entity.HasOne(e => e.ShoppingList)
                .WithMany(s => s.Ingredients)
                .HasForeignKey(e => e.ShoppingListId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Ingredient)
                .WithMany(i => i.ShoppingListIngredients)
                .HasForeignKey(e => e.IngredientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.ToTable("ShoppingListIngredients");
        });
    }
}
