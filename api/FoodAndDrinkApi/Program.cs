using FoodAndDrinkDomain;
using FoodAndDrinkDomain.Configuration;
using FoodAndDrinkDomain.Entities;
using FoodAndDrinkRepository.Repositories;
using FoodAndDrinkService.Services;
using Microsoft.Extensions.FileProviders;
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

builder.Services.AddScoped<IMealService, MealService>();
builder.Services.AddScoped<IDrinkService, DrinkService>();
builder.Services.AddScoped<IIngredientService, IngredientService>();

builder.Services.AddScoped<IMealRepository, MealRepository>();
builder.Services.AddScoped<IDrinkRepository, DrinkRepository>();
builder.Services.AddScoped<IIngredientRepository, IngredientRepository>();

var mongoDbConfig = builder.Configuration.GetSection("MongoDB").Get<MongoDbConfiguration>();
var mongoClientSettings = MongoClientSettings.FromConnectionString(mongoDbConfig!.ConnectionString);
builder.Services.AddSingleton<IMongoClient>(x => new MongoClient(mongoClientSettings));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoClient>().GetDatabase(mongoDbConfig.DatabaseName));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<MealDocument>(mongoDbConfig.MealCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<DrinkDocument>(mongoDbConfig.DrinkCollection));
builder.Services.AddSingleton(x => x.GetRequiredService<IMongoDatabase>().GetCollection<IngredientDocument>(mongoDbConfig.IngredientCollection));

var app = builder.Build();

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

app.MapControllers();

app.Run();
