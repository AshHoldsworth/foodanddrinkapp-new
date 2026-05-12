# Food and Drink API

.NET 9 backend for authentication, meals, drinks, ingredients, meal plans, and shopping lists.

## Structure

```text
api/
├── FoodAndDrinkApi/         ASP.NET Core API project
├── FoodAndDrinkApi.Tests/   xUnit test project
├── FoodAndDrinkDomain/      shared models, DTOs, entities, configuration
├── FoodAndDrinkRepository/  MongoDB repositories
└── FoodAndDrinkService/     business logic services
```

## Runtime Overview

The API:

- Uses MongoDB for persistence
- Uses JWT bearer authentication
- Reads the auth token from the `fd_auth_token` cookie
- Allows CORS from `http://localhost:3000`
- Serves uploaded files from `/media`

## Main Controllers

Routes are mounted without an `/api` prefix.

### Auth

Base route: `/auth`

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/register`
- `GET /auth/me`
- `POST /auth/change-password`
- `GET /auth/users` (admin)
- `PUT /auth/users/{id}` (admin)
- `DELETE /auth/users/{id}` (admin)
- `GET /auth/user-groups` (admin)
- `POST /auth/user-groups` (admin)

### Meals

Base route: `/meal`

- `GET /meal/all`
- `GET /meal/plan`
- `POST /meal/plan`
- `POST /meal/add`
- `POST /meal/update`
- `POST /meal/delete`

### Drinks

Base route: `/drink`

- `GET /drink/all`
- `GET /drink`
- `POST /drink/add`
- `POST /drink/update`
- `POST /drink/delete`

### Ingredients

Base route: `/ingredient`

- `GET /ingredient/all`
- `GET /ingredient/list`
- `GET /ingredient`
- `POST /ingredient/add`
- `POST /ingredient/update`
- `POST /ingredient/update-stock-batch`
- `DELETE /ingredient/delete`

### Shopping Lists

Base route: `/shopping-list`

- `GET /shopping-list/current`
- `GET /shopping-list/completed`
- `POST /shopping-list/generate`
- `POST /shopping-list/item/purchase`
- `POST /shopping-list/complete`

Most routes require authentication. Admin-only routes are explicitly marked with role-based authorization.

## Prerequisites

- .NET SDK 9.x
- MongoDB

## Run Locally

```bash
cd api
dotnet restore FoodAndDrinkApi.sln
dotnet run --project FoodAndDrinkApi
```

Default local URLs:

- `http://localhost:5237`
- `https://localhost:7015`

With Docker Compose, the API listens on `http://localhost:8080`.

## Configuration

This repository does not currently ship an `appsettings.json` file for local overrides, so environment variables are the primary configuration mechanism.

### Auth

Authentication is provided by Authentik headers forwarded by the reverse proxy.

### MongoDB

- `MongoDB__ConnectionString`
- `MongoDB__DatabaseName`
- `MongoDB__MealCollection`
- `MongoDB__DrinkCollection`
- `MongoDB__IngredientCollection`
- `MongoDB__MealPlanCollection`
- `MongoDB__ShoppingListCollection`
- `MongoDB__InventoryCollection`
- `MongoDB__UserCollection`
- `MongoDB__UserGroupCollection`

Docker Compose currently sets:

- `MongoDB__ConnectionString=mongodb://mongo:27017`
- `MongoDB__DatabaseName=FoodAndDrinkApp`
- `MongoDB__MealCollection=meals`
- `MongoDB__DrinkCollection=drinks`
- `MongoDB__IngredientCollection=ingredients`
- `MongoDB__InventoryCollection=inventory`
- `MongoDB__UserGroupCollection=userGroups`
- `MongoDB__MealPlanCollection=mealPlans`
- `MongoDB__ShoppingListCollection=shoppingLists`
- `MongoDB__UserCollection=users`

## Tests

Run the backend test suite with:

```bash
cd api
dotnet test FoodAndDrinkApi.sln
```

The test project lives in `FoodAndDrinkApi.Tests` and uses xUnit plus NSubstitute.

## Database Migrations (Postgres)

Use EF Core migrations to evolve schema changes between deployments.

Create a migration after model changes:

```bash
cd api
dotnet ef migrations add <MigrationName> \
	--project FoodAndDrinkRepository \
	--startup-project FoodAndDrinkApi \
	--output-dir Data/Migrations
```

Apply migrations to the configured database:

```bash
cd api
dotnet ef database update \
	--project FoodAndDrinkRepository \
	--startup-project FoodAndDrinkApi
```

Deployment order for test environment:

1. Deploy the new app version.
2. Run `dotnet ef database update` against the test database.
3. Start or restart API instances.

Notes:

- The API applies pending migrations on startup via `db.Database.Migrate()`.
- If your existing test database was created with `EnsureCreated`, reset it once before adopting migrations to avoid migration history drift.

## Related Docs

- `../README.md`
- `../scripts/README.md`
