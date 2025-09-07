# Food & Drink App Frontend

A modern Next.js frontend application for managing food recipes and ingredients.

## Features

- **Dashboard**: View all food recipes in a clean, card-based layout
- **Add Food**: Create new food recipes with multiple ingredients
- **Add Ingredients**: Create new ingredients with nutritional information
- **Food Details**: View detailed information about each food recipe
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Notifications**: User-friendly toast notifications for actions

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Your Food & Drink API running on `http://localhost:5237`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### API Configuration

The frontend is configured to connect to your API at `http://localhost:5237`. If your API is running on a different port, update the `API_BASE_URL` in `lib/api.ts`.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── foods/
│   │   ├── add/           # Add new food page
│   │   └── [id]/          # Food detail page
│   ├── ingredients/
│   │   └── add/           # Add new ingredient page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── lib/
│   └── api.ts             # API service functions
├── types/
│   └── index.ts           # TypeScript type definitions
└── public/                # Static assets
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### Dashboard
- Displays all food recipes in a responsive grid
- Shows key metrics: rating, cost, speed, difficulty
- Quick add buttons for foods and ingredients
- Loading states and empty states

### Add Food Form
- Multi-step form for creating food recipes
- Dynamic ingredient management
- Validation for required fields
- Real-time form updates

### Add Ingredient Form
- Simple form for creating ingredients
- Support for multiple barcodes
- Macro type categorization
- Health option tagging

### Food Detail View
- Comprehensive food information display
- Ingredient breakdown with details
- Interactive statistics display
- Navigation to edit functionality

## API Integration

The frontend integrates with your C# API using the following endpoints:

- `GET /food/all` - Fetch all foods
- `GET /food?id={id}` - Fetch food by ID
- `POST /food/add` - Add new food
- `POST /food/update` - Update existing food
- `POST /ingredient/add` - Add new ingredient

## Styling

The application uses Tailwind CSS for styling with a focus on:
- Clean, modern design
- Responsive layouts
- Accessible color schemes
- Consistent spacing and typography
- Interactive hover states

## Error Handling

- Network errors are caught and displayed as toast notifications
- Loading states prevent multiple submissions
- Form validation ensures data integrity
- Graceful fallbacks for missing data
