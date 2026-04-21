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

- `JWT_SECRET`

If `JWT_SECRET` is not provided, the API falls back to a development-only default secret.

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
- `MongoDB__DatabaseName=FoodAndDrinkDb`
- `MongoDB__MealCollection=foods`
- `MongoDB__DrinkCollection=drinks`
- `MongoDB__IngredientCollection=ingredients`

## Tests

Run the backend test suite with:

```bash
cd api
dotnet test FoodAndDrinkApi.sln
```

The test project lives in `FoodAndDrinkApi.Tests` and uses xUnit plus NSubstitute.

## Related Docs

- `../README.md`
- `../scripts/README.md`
