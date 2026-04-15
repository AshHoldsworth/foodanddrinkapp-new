# Meal & Drink App - Backend API

A .NET 9.0 Web API backend for the Meal & Drink management system, built with clean architecture principles and MongoDB integration.

## 🚀 Features

- **RESTful API**: Full CRUD operations for meal items and ingredients
- **Clean Architecture**: Separation of concerns with multiple layers
- **MongoDB Integration**: NoSQL database for flexible data storage
- **Model Validation**: Request/response validation and error handling
- **Cross-Platform**: Built on .NET 9.0 for cross-platform deployment
- **Swagger/OpenAPI**: Interactive API documentation
- **Dependency Injection**: Built-in DI container for loose coupling

## 🏗️ Architecture

The API follows clean architecture principles with clear separation of concerns:

```
api/
├── FoodAndDrinkApi/           # Web API Layer
│   ├── Controllers/           # API Controllers
│   │   ├── MealController.cs
│   │   └── IngredientController.cs
│   ├── Requests/             # Request DTOs
│   ├── Responses/            # Response DTOs
│   └── Program.cs            # Application entry point
├── FoodAndDrinkService/      # Business Logic Layer
│   └── Services/             # Service implementations
├── FoodAndDrinkDomain/       # Domain Layer
│   ├── Models/               # Domain models
│   ├── Entities/             # Database entities
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Exceptions/           # Custom exceptions
│   └── Configuration/        # Configuration classes
└── FoodAndDrinkRepository/   # Data Access Layer
    └── Repositories/         # Repository implementations
```

## 🛠️ Tech Stack

- **.NET 9.0** - Latest .NET framework
- **ASP.NET Core Web API** - RESTful API framework
- **MongoDB** - NoSQL document database
- **C#** - Primary programming language
- **Swagger/OpenAPI** - API documentation
- **Microsoft.Extensions.Logging** - Built-in logging

## 📋 API Endpoints

### Meal Controller
- `GET /api/meal` - Get all meal items
- `GET /api/meal/{id}` - Get meal item by ID
- `POST /api/meal` - Create new meal item
- `PUT /api/meal/{id}` - Update existing meal item
- `DELETE /api/meal/{id}` - Delete meal item

### Ingredient Controller
- `GET /api/ingredient` - Get all ingredients
- `GET /api/ingredient/{id}` - Get ingredient by ID
- `POST /api/ingredient` - Create new ingredient
- `PUT /api/ingredient/{id}` - Update existing ingredient
- `DELETE /api/ingredient/{id}` - Delete ingredient

## 🚦 Getting Started

### Prerequisites

- **.NET 9.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/9.0)
- **MongoDB** - Local instance or cloud connection (MongoDB Atlas)
- **IDE** (optional but recommended):
  - JetBrains Rider
  - Visual Studio 2022
  - Visual Studio Code with C# extension

### Installation & Setup

1. **Clone and navigate to the API directory:**
   ```bash
   cd api
   ```

2. **Restore NuGet packages:**
   ```bash
   dotnet restore
   ```

3. **Configure MongoDB connection:**
   - Update `appsettings.json` with your MongoDB connection string
   - Or set environment variables for the connection

4. **Build the solution:**
   ```bash
   dotnet build
   ```

5. **Run the API:**
   ```bash
   dotnet run --project FoodAndDrinkApi
   ```

   **Alternative**: Open `FoodAndDrinkApi.sln` in your preferred IDE and run from there.

6. **Access the API:**
   - HTTPS: `https://localhost:7015`
   - HTTP: `http://localhost:5237`
   - Swagger UI: `https://localhost:7015/swagger`

## 📋 Available Commands

- `dotnet run --project FoodAndDrinkApi` - Start the API server
- `dotnet build` - Build the entire solution
- `dotnet test` - Run unit tests (when available)
- `dotnet publish` - Publish for deployment
- `dotnet restore` - Restore NuGet packages

## 🔧 Configuration

### MongoDB Configuration

Configure your MongoDB connection in `appsettings.json`:

```json
{
  "MongoDB": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "FoodAndDrinkDB"
  }
}
```

Or use environment variables:
- `MongoDB__ConnectionString`
- `MongoDB__DatabaseName`

### Logging Configuration

The API uses Microsoft.Extensions.Logging with configurable log levels in `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## 📊 Data Models

### Meal Model
```csharp
public class Meal
{
    public string Id { get; set; }
    public string Name { get; set; }
    public int Rating { get; set; } // 1-3
    public bool IsHealthyOption { get; set; }
    public int Cost { get; set; } // 1-3 (Cheap, Moderate, Expensive)
    public string Course { get; set; } // Breakfast, Lunch, Dinner
    public int Difficulty { get; set; } // 1-3
    public int Speed { get; set; } // 1-3
    public List<string> Ingredients { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

### Ingredient Model
```csharp
public class Ingredient
{
    public string Id { get; set; }
    public string Name { get; set; }
    // Additional properties as needed
}
```

## 🧪 Testing

Run tests using:
```bash
dotnet test
```

*Note: Unit tests to be implemented as the project grows.*

## 🚀 Deployment

### Build for Production
```bash
dotnet publish -c Release -o ./publish
```

### Docker (Future Enhancement)
```dockerfile
# Dockerfile example for containerization
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY ./publish .
ENTRYPOINT ["dotnet", "FoodAndDrinkApi.dll"]
```

## 🔒 Security Considerations

- **Input Validation**: All request models include validation attributes
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **CORS**: Configure CORS policies for frontend integration
- **Authentication**: To be implemented for production use

## 📚 API Documentation

When running the API, visit:
- **Swagger UI**: `https://localhost:7015/swagger`
- **OpenAPI JSON**: `https://localhost:7015/swagger/v1/swagger.json`

## 🤖 Development Tools

This backend application was built with assistance from AI development tools:
- **GitHub Copilot** - AI-powered code completion and suggestions
- **Claude Sonnet 4** - AI assistant for code generation and problem-solving

## 🏗️ Future Enhancements

- **Authentication & Authorization**: JWT token-based security
- **Caching**: Redis integration for improved performance
- **Logging**: Structured logging with Serilog
- **Health Checks**: Endpoint monitoring and health checks
- **Rate Limiting**: API throttling and rate limiting
- **Unit Tests**: Comprehensive test coverage
- **Integration Tests**: End-to-end API testing
- **Docker Support**: Containerization for easy deployment
- **CI/CD Pipeline**: Automated build and deployment

