# Food & Drink App

A full-stack application for managing and tracking food items, recipes, and ingredients. Built with Next.js frontend and .NET Core backend.

## 🚀 Features

- **Food Management**: Add, edit, and manage food items with detailed properties
- **Rating System**: Rate foods from 1-3 stars
- **Health Tracking**: Mark foods as healthy options
- **Cost Management**: Track food costs (Cheap, Moderate, Expensive)
- **Course Classification**: Organize foods by meal type (Breakfast, Lunch, Dinner)
- **Difficulty & Speed**: Rate cooking difficulty and preparation speed
- **Ingredients**: Manage ingredient lists for each food item
- **Search & Filter**: Find foods quickly with search functionality
- **Responsive Design**: Mobile-first design with modern UI

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind CSS
- **Heroicons** - Beautiful hand-crafted SVG icons

### Backend
- **.NET 9.0** - Cross-platform web framework
- **ASP.NET Core Web API** - RESTful API framework
- **MongoDB** - NoSQL database for data persistence
- **Clean Architecture** - Separation of concerns with multiple layers:
  - API Layer (Controllers, Requests/Responses)
  - Service Layer (Business logic)
  - Domain Layer (Models, DTOs, Entities)
  - Repository Layer (Data access)

## 📁 Project Structure

```
foodanddrinkapp-new/
├── frontend/                 # Next.js React application
│   ├── app/                 # App Router pages and API routes
│   ├── components/          # Reusable React components
│   ├── models/              # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── constants/           # Application constants
└── api/                     # .NET Core backend
    ├── FoodAndDrinkApi/     # Web API project
    ├── FoodAndDrinkDomain/  # Domain models and DTOs
    ├── FoodAndDrinkService/ # Business logic services
    └── FoodAndDrinkRepository/ # Data access layer
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **.NET 9.0 SDK**
- **MongoDB** (local or cloud instance)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Restore .NET packages:
   ```bash
   dotnet restore
   ```

3. Configure MongoDB connection in `appsettings.json` or environment variables

4. Run the API:
   ```bash
   dotnet run --project FoodAndDrinkApi
   ```

   **Alternative**: You can also open the solution in an IDE such as:
   - **JetBrains Rider** - Open `FoodAndDrinkApi.sln`
   - **Visual Studio** - Open `FoodAndDrinkApi.sln`
   - **Visual Studio Code** - Open the `api` folder with the C# extension

The API will be available at `https://localhost:7015` or `http://localhost:5237`

## 📋 Available Scripts

### Frontend
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `dotnet run` - Start the API server
- `dotnet build` - Build the solution
- `dotnet test` - Run tests (when available)

## 🎨 UI Components

The application features a modern, responsive design with:

- **AddModal**: Modal for adding new food items with comprehensive form fields
- **SearchBox**: Real-time search functionality
- **RangeSelector**: Interactive sliders for rating values
- **Toggle**: Switch components for boolean options
- **Select**: Dropdown components for categorical data
- **Alert**: Notification system for user feedback
- **FloatingActionButton**: Quick access to add new items

## 🔧 Configuration

### MongoDB Configuration
Configure your MongoDB connection in the backend:
- Update connection strings in `appsettings.json`
- Set up MongoDB collections for foods and ingredients
- Configure authentication if required

## 🤝 Contributing

Currently not open for contributions.

## 📝 License

This project is private and not licensed for public use.

## 🤖 Development Tools

This application was built with assistance from AI development tools:
- **GitHub Copilot** - AI-powered code completion and suggestions
- **Claude Sonnet 4** - AI assistant for code generation and problem-solving

## 🏗️ Future Enhancements

- User authentication and authorization
- Recipe management with step-by-step instructions
- Meal planning and calendar integration
- Nutritional information tracking
- Shopping list generation
- Photo upload for food items
- Bug / Feature fixes
- Ability to link ingredients to recipes
- More comprehensive searching and filtering (eg. by ingredients)
