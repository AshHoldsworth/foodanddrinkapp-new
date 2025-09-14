# Food & Drink App - Frontend

The frontend application for the Food & Drink management system, built with Next.js 15, React 19, and TypeScript.

## 🚀 Features

- **Modern UI**: Built with Tailwind CSS and DaisyUI components
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Food Management**: Add, edit, and view food items with detailed properties
- **Search & Filter**: Real-time search functionality for food items
- **Rating System**: Interactive star rating system (1-3 stars)
- **Modal Forms**: Comprehensive forms for adding new food items
- **Alert System**: User feedback with success, error, and warning notifications
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind CSS
- **Heroicons** - Beautiful SVG icons

## 📁 Project Structure

```
frontend/
├── app/                     # Next.js App Router
│   ├── api/                # API route handlers
│   ├── food/               # Food-related pages
│   ├── ingredients/        # Ingredient-related pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable React components
│   ├── home/              # Home page specific components
│   ├── AddModal.tsx       # Modal for adding items
│   ├── Alert.tsx          # Alert/notification component
│   ├── Header.tsx         # Navigation header
│   └── ...               # Other UI components
├── models/                # TypeScript type definitions
├── utils/                 # Utility functions
└── constants/             # Application constants
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation & Development

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

2. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

4. Start editing! The page auto-updates as you edit files.

### Backend Integration

Make sure the backend API is running on `https://localhost:7015` or `http://localhost:5237` for full functionality.

## 📋 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🎨 Key Components

- **AddModal**: Comprehensive modal for adding new food items with form validation
- **SearchBox**: Real-time search functionality with debouncing
- **RangeSelector**: Interactive sliders for rating values
- **Toggle**: Switch components for boolean options (e.g., healthy choice)
- **Select**: Dropdown components for categorical data
- **Alert**: Notification system for user feedback
- **Header**: Navigation and branding
- **FloatingActionButton**: Quick access to add new items

## 🔧 Configuration

The application is configured to work with:
- **API Endpoint**: Configurable backend API integration
- **Tailwind CSS**: Custom styling with DaisyUI theme
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency rules

## 📱 Responsive Design

The application is built mobile-first and includes:
- Responsive layouts for all screen sizes
- Touch-friendly interactions
- Optimized mobile navigation
- Adaptive component layouts

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Learn about React 19 features
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com/) - Component library documentation
- [TypeScript](https://www.typescriptlang.org/docs/) - TypeScript language reference
