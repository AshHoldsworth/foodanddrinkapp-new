using FoodAndDrinkDomain.Configuration;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkRepository.Repositories;
using FoodAndDrinkService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.Configure<MongoDbConfiguration>(builder.Configuration.GetSection("MongoDB"));

var jwtSecret = builder.Configuration["JWT_SECRET"]
    ?? Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? "dev-jwt-secret-change-me-32chars!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromMinutes(1),
            RoleClaimType = "role",
            NameClaimType = "name",
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["fd_auth_token"];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IMealService, MealService>();
builder.Services.AddScoped<IMealPlanService, MealPlanService>();
builder.Services.AddScoped<IShoppingListService, ShoppingListService>();
builder.Services.AddScoped<IDrinkService, DrinkService>();
builder.Services.AddScoped<IIngredientService, IngredientService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IMealRepository, MealRepository>();
builder.Services.AddScoped<IMealPlanRepository, MealPlanRepository>();
builder.Services.AddScoped<IShoppingListRepository, ShoppingListRepository>();
builder.Services.AddScoped<IDrinkRepository, DrinkRepository>();
builder.Services.AddScoped<IIngredientRepository, IngredientRepository>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserGroupRepository, UserGroupRepository>();

var mongoDbConfig = builder.Configuration.GetSection("MongoDB").Get<MongoDbConfiguration>();
var mongoClientSettings = MongoClientSettings.FromConnectionString(mongoDbConfig!.ConnectionString);

builder.Services.AddSingleton<IMongoClient>(x => new MongoClient(mongoClientSettings));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoClient>().GetDatabase(mongoDbConfig.DatabaseName));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<MealDocument>(mongoDbConfig.MealCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<MealPlanDocument>(mongoDbConfig.MealPlanCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<ShoppingListDocument>(mongoDbConfig.ShoppingListCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<DrinkDocument>(mongoDbConfig.DrinkCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<IngredientDocument>(mongoDbConfig.IngredientCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<InventoryDocument>(mongoDbConfig.InventoryCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<UserDocument>(mongoDbConfig.UserCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<UserGroupDocument>(mongoDbConfig.UserGroupCollection));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
    await authService.EnsureAdminUserFromEnvironment();
}

var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);

// Use CORS middleware
app.UseCors("AllowFrontend");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/media"
});

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
