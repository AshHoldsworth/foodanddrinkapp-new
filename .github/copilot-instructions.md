# Copilot Instructions

This is a full-stack meal planning application. The backend is .NET 9 (ASP.NET Core Web API) under `api/`, and the frontend is Next.js 16 (App Router) under `frontend/`. MongoDB is the database. The stack runs together via Docker Compose.

---

## Commands

### Frontend (`frontend/`)
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Watch mode

# Run a single test by name
npx vitest -t "test name here"
```

### Backend (`api/`)
```bash
dotnet run --project FoodAndDrinkApi   # Start API (port 5237)
dotnet test FoodAndDrinkApi.sln        # Run all tests

# Run a single test class or method
dotnet test --filter "FullyQualifiedName~MealServiceTests"
dotnet test --filter "FullyQualifiedName~MealServiceTests.GetMealById_ReturnsMeal"
```

### Full Stack (Docker)
```bash
docker compose up    # Starts MongoDB (27018), API (8080), Frontend (3000)
```

Requires a `.env` file at the root — copy from `.env.example`. `JWT_SECRET` must be 32+ characters.

---

## Architecture

### Request Flow
```
Browser → Next.js frontend (port 3000)
       → /backend/:path* proxy → ASP.NET Core API (port 5237/8080)
       → Service layer → Repository layer → MongoDB
```

The frontend proxies all `/backend/*` requests to `BACKEND_URL` (set in `next.config.ts`). API functions in `frontend/app/api/` are the only place that constructs these URLs.

### Backend Layer Structure
```
Controllers  →  Services  →  Repositories  →  MongoDB
                ↕
            Domain (Entities, Models, DTOs, Exceptions)
```
- **Controllers** (`FoodAndDrinkApi/Controllers/`): Handle HTTP, use `[Authorize]` attribute, return `ApiResponse<T>`
- **Services** (`FoodAndDrinkService/Services/`): Business logic, implement `I[Name]Service` interfaces
- **Repositories** (`FoodAndDrinkRepository/Repositories/`): MongoDB data access only
- **Domain** (`FoodAndDrinkDomain/`): Entities (MongoDB docs), Models (business), DTOs, Exceptions

### Frontend Structure
```
app/
  (protected)/         # Route group — all pages require auth
    [feature]/page.tsx # Server component: checks auth, renders Client wrapper
    layout.tsx         # Protected shell with Header, modals, dock
  api/                 # Centralised fetch functions (mealsApi, drinkApi, etc.)
  no-group/            # Pages for authenticated users without a group

components/            # Reusable UI (cards, filters, modals, selectors)
contexts/              # ModalContext, DockContext
models/                # TypeScript types (Meal, Drink, Ingredient, etc.)
constants/             # Shared constants (courses, ratings, macros, nav items)
utils/                 # Pure utility functions
lib/                   # Auth helpers (JWT verification via jose)
```

---

## Key Conventions

### Authentication
- JWT is stored in the `fd_auth_token` cookie. The API reads it via `OnMessageReceived`. The frontend sends it with `credentials: 'include'` on every fetch.
- Auth is verified server-side in `(protected)/layout.tsx` using `getAuthSession()` from `lib/`.
- Role (`admin`/`user`) is embedded in the JWT claim and checked with `[Authorize(Roles = "...")]`.

### Backend: `ApiResponse<T>`
All controller actions return `ApiResponse<T>`:
```csharp
return ApiResponse<Meal>.SuccessResult(meal);
return ApiResponse<Meal>.FailureResult(ErrorCodes.MealNotFound, "Meal not found");
```
Error codes are `const string` fields in `FoodAndDrinkApi/Responses/Constants/`.

### Backend: Exception-Based Errors
Services throw typed exceptions (e.g., `MealNotFoundException`, `MealAlreadyExistsException`). Controllers catch these and map them to `ApiResponse` failure results. Do not return error results directly from services.

### Backend: Document ↔ Model Conversion
MongoDB documents (`MealDocument`) and business models (`Meal`) are separate types in `FoodAndDrinkDomain`. They convert via implicit cast operators:
```csharp
Meal meal = (Meal)mealDocument;
```

### Backend: Partial Updates
Update requests have nullable fields. Services build a `[Entity]UpdateDetails` DTO and call `model.Update(details)`, which throws `[Entity]NoUpdatesDetectedException` if nothing changed.

### Frontend: Server vs Client Components
Each protected page has two files:
- `page.tsx` — `async` server component: checks auth, passes initial data
- `[Feature]PageClient.tsx` — `'use client'` component: holds `useState`, event handlers, fetch calls

### Frontend: API Layer
All backend calls go through typed functions in `frontend/app/api/`. The central `webApi.ts` exports `apiGet`, `apiPost`, `apiPostJson`, `apiPutJson`, `apiDelete`. Add new endpoints here, not inline in components.

### Frontend: Image Uploads
Use `FormData` (not JSON) when a request includes an image file. Append all fields manually including nested structures. The API endpoint must accept `multipart/form-data`.

### Tests
- **Frontend**: Tests live in `_tests_/` folders co-located with the code they test. Use Vitest + Testing Library. Mock API calls; test behaviour.
- **Backend**: Tests in `FoodAndDrinkApi.Tests/`. Use xUnit + NSubstitute. Separate test classes for Controllers and Services.
