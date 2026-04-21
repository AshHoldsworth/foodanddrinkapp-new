# Food and Drink App

Full-stack meal planning and food tracking application with a Next.js frontend, a .NET API, and MongoDB.

## Overview

This repository contains:

- A Next.js 16 frontend in `frontend`
- A .NET 9 backend in `api`
- Docker Compose for local full-stack startup
- MongoDB seed and index helper scripts in `scripts`

The app currently covers:

- Authentication with JWT stored in an `fd_auth_token` cookie
- Meal, drink, and ingredient management
- Weekly meal planning
- Shopping list generation and completion flows
- Admin user bootstrap support

## Repository Layout

```text
.
├── api/           .NET API, domain, services, repositories, and tests
├── frontend/      Next.js app router frontend
├── scripts/       MongoDB seeding and indexing helpers
└── docker-compose.yml
```

## Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- DaisyUI
- Vitest and Testing Library

### Backend

- .NET 9
- ASP.NET Core Web API
- MongoDB
- JWT bearer authentication
- xUnit and NSubstitute

## Prerequisites

- Node.js 20 or newer
- npm
- .NET SDK 9.x
- MongoDB
- `mongosh` if you want to run the scripts in `scripts`

## Local Development

### Option 1: Run everything with Docker Compose

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`
- MongoDB: `mongodb://localhost:27018`

The frontend container is configured with `BACKEND_URL=http://api:8080`.

### Option 2: Run services directly

Start MongoDB first, then run the backend:

```bash
cd api
dotnet restore FoodAndDrinkApi.sln
dotnet run --project FoodAndDrinkApi
```

The API uses:

- `http://localhost:5237`
- `https://localhost:7015`

Then run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies `/backend/:path*` to `BACKEND_URL`, which defaults to `http://localhost:5237` in local development.

## Testing

Frontend:

```bash
cd frontend
npm run test
```

Backend:

```bash
cd api
dotnet test FoodAndDrinkApi.sln
```

## Scripts

Helper scripts live in `scripts`:

- `seed-admin.sh`
- `seed-indexes.sh`
- `seed-ingredients.sh`

See `scripts/README.md` for usage, defaults, and Docker Compose examples.

## Additional Documentation

- `api/README.md`
- `frontend/README.md`
- `scripts/README.md`
