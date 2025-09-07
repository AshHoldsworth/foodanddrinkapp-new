using FoodAndDrinkDomain;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkRepository.Repositories;
using FoodAndDrinkService.Services;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// builder.Services.AddOpenApi();

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

builder.Services.AddScoped<IFoodService, FoodService>();
builder.Services.AddScoped<IIngredientService, IngredientService>();

builder.Services.AddScoped<IFoodRepository, FoodRepository>();
builder.Services.AddScoped<IIngredientRepository, IngredientRepository>();

var mongoDbConfig = builder.Configuration.GetSection("MongoDb").Get<MongoDbConfiguration>();
var mongoClientSettings = MongoClientSettings.FromConnectionString(mongoDbConfig!.ConnectionString);
builder.Services.AddSingleton<IMongoClient>(x => new MongoClient(mongoClientSettings));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoClient>().GetDatabase(mongoDbConfig.DatabaseName));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<FoodDocument>(mongoDbConfig.FoodCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<IngredientDocument>(mongoDbConfig.IngredientCollection));

var app = builder.Build();

// Use CORS middleware
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
