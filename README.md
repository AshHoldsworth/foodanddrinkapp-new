# 🍽️ Food & Drink App

Full-stack food and drink application with a Next.js frontend and .NET API backend.

## 📌 Current State

- Frontend and backend are both active and integrated through `/backend` proxy routes.
- Main entities supported: **Food**, **Drink**, and **Ingredient**.
- Add flows support image upload for food and drink.
- Filtering and search are available for listing pages.
- Unit tests are in place for frontend components/utilities and backend controllers/services.
- Docker image builds run unit tests as part of the Dockerfiles.
- GitHub Actions workflows build Docker images, which enforces tests in CI.

## 🛠️ Tech Stack

### 🎨 Frontend

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS + DaisyUI
- Heroicons
- Vitest + Testing Library

### ⚙️ Backend

- .NET 9 Web API
- MongoDB
- Layered architecture:
    - `FoodAndDrinkApi` (controllers + request/response contracts)
    - `FoodAndDrinkService` (business logic)
    - `FoodAndDrinkDomain` (models, DTOs, exceptions)
    - `FoodAndDrinkRepository` (Mongo data access)
- xUnit + NSubstitute for unit tests

## 🗂️ Repository Layout

```text
foodanddrinkapp-new/
   frontend/
   api/
      FoodAndDrinkApi.sln
      FoodAndDrinkApi/
      FoodAndDrinkApi.Tests/
      FoodAndDrinkService/
      FoodAndDrinkDomain/
      FoodAndDrinkRepository/
   .github/workflows/
```

## ✨ Features

- 🥗 Manage food, drink, and ingredient records
- ⭐ Ratings (`1-10`) and cost/speed/difficulty metadata
- 💚 Healthy option flags
- 🧂 Ingredient suggestions while composing food/drink
- 🪟 Client-side modal workflows for create actions
- 🔎 Search and filtered list views
- 📱 Responsive UI components across mobile/desktop

## 💻 Local Development

### ✅ Prerequisites

- Node.js 20+ (22 recommended)
- .NET SDK 9.0.x
- MongoDB instance

### 🖥️ Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

When running in Docker Compose, the frontend uses `BACKEND_URL=http://api:8080`.
When running locally outside Docker, it falls back to `http://localhost:5237`.

### 🔧 Backend

```bash
cd api
dotnet restore FoodAndDrinkApi.sln
dotnet run --project FoodAndDrinkApi
```

API defaults to `http://localhost:5237` / `https://localhost:7015`.

## 🐳 Docker Compose

Run the full stack:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- API: `http://localhost:5237`
- MongoDB: `mongodb://localhost:27017`

Compose file location: `docker-compose.yml`.

## 🧪 Testing

### 🧵 Frontend Tests

```bash
cd frontend
npm run test
```

Current frontend tests include utility tests plus coverage for all components in `frontend/components`.

### 🧱 Backend Tests

```bash
cd api
dotnet test FoodAndDrinkApi.sln
```

Current backend tests include all controllers and services under `api/FoodAndDrinkApi.Tests`.

## 🤖 CI Workflows

- `api-build.yml`
    - 🐳 Builds API Docker image
    - 🧪 API tests run inside the API Dockerfile build stage

- `frontend-build.yml`
    - 🐳 Builds frontend Docker image
    - 🧪 Frontend tests run inside the frontend Dockerfile build stage

## 📝 Notes

- The API test project is included in `FoodAndDrinkApi.sln`.
- Frontend Vitest is configured with `jsdom` and Testing Library in `frontend/vitest.config.ts` and `frontend/vitest.setup.ts`.
- The frontend backend rewrite target is configurable through `BACKEND_URL` in `frontend/next.config.ts`.
