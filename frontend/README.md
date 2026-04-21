# Food and Drink Frontend

Next.js 16 frontend for the Food and Drink app.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- DaisyUI
- Vitest
- Testing Library

## Application Layout

```text
frontend/
├── app/            routes, layouts, and route groups
├── components/     reusable UI and feature components
├── constants/      shared labels, filters, and option lists
├── contexts/       React context providers
├── lib/            auth helpers
├── models/         shared TypeScript models
├── public/         static assets
└── utils/          utility functions and tests
```

Notable route areas under `app`:

- `(protected)` for authenticated pages
- `no-group` for flows outside a selected group context
- `api` for frontend-side route handlers

## Backend Integration

The frontend proxies backend requests through `/backend/:path*` using a rewrite in `next.config.ts`.

- Local default backend: `http://localhost:5237`
- Docker Compose backend: `http://api:8080`

This keeps the browser talking to the frontend origin while forwarding API traffic to the .NET service.

## Development

Install dependencies and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

Make sure the backend is running if you want authenticated flows and live data.

## Available Scripts

- `npm run dev` starts the dev server
- `npm run build` builds the app with Turbopack
- `npm run start` runs the production server
- `npm run lint` runs ESLint
- `npm run test` runs the Vitest suite once
- `npm run test:watch` runs Vitest in watch mode

## Testing

```bash
cd frontend
npm run test
```

Tests are configured through `vitest.config.ts` and `vitest.setup.ts`.

## Notes

- Auth-related behavior is supported by helpers in `lib/auth.ts`
- Shared visual building blocks live in `components`, including cards, filters, selectors, and modals
- The app is set up to run as a standalone build in production

## Related Docs

- `../README.md`
- `../api/README.md`
