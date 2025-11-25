# NutritionWise - Nutrition Tracking Application

## Overview

NutritionWise is a comprehensive mobile-first nutrition tracking application designed for Italian-speaking users (with English support). The application enables users to manage their food database, create custom meals, track daily nutritional intake, plan weekly meals, manage shopping lists, monitor health metrics, and visualize their nutritional habits through statistics and gamification features.

**Primary Purpose**: Help users monitor dietary intake, achieve nutritional goals, and maintain healthy eating habits through an intuitive, mobile-optimized interface.

**Target Platform**: Mobile-first (Android smartphones), with responsive design for larger screens.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**State Management**:
- TanStack Query (React Query) for server state and data fetching
- Local React state (useState) for UI state
- LocalStorage as the primary data persistence layer (abstracted through `client/src/lib/storage.ts`)

**Routing**: 
- `wouter` for client-side routing (lightweight React Router alternative)
- Route definitions in `client/src/App.tsx`

**UI Components**:
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component system (configured in `components.json`)
- Tailwind CSS for styling with custom design tokens
- Mobile-first responsive design principles

**Design System**:
- Typography: Inter font family from Google Fonts
- Color system: HSL-based with CSS custom properties for theming
- Spacing: Tailwind's spacing scale (multiples of 4px)
- Component library follows "New York" shadcn variant
- Mobile optimization: Thumb-zone optimization, bottom navigation, touch-friendly targets

**Key Architectural Patterns**:
- Component-based architecture with reusable UI components
- Custom hooks for shared logic (e.g., `use-toast`, `use-mobile`)
- Context API for global state (language/i18n via `LanguageProvider`)
- Separation of concerns: Components, pages, lib utilities, and shared types

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**Current State**: 
- Minimal backend implementation (`server/routes.ts` is mostly empty)
- Storage interface defined but using in-memory implementation (`MemStorage`)
- API routes not yet implemented (application currently uses client-side LocalStorage)

**Planned Architecture**:
- RESTful API design pattern (route registration in `server/routes.ts`)
- Database layer abstraction through `IStorage` interface in `server/storage.ts`
- Express middleware for JSON parsing and request logging
- Vite integration for development HMR and production builds

**Build Strategy**:
- Development: Vite dev server with Express middleware mode
- Production: Bundled client assets served by Express static middleware
- TypeScript compilation via `tsx` (development) and `esbuild` (production)

### Data Storage Solutions

**Current Implementation**: 
- Client-side LocalStorage accessed through abstraction layer (`client/src/lib/storage.ts`)
- All CRUD operations centralized in storage module
- Data models: Foods, Meals, DiaryEntries, ShoppingLists, Settings, Badges, HealthData, WeeklyAssignments

**Database Schema** (defined but not yet implemented):
- PostgreSQL with Neon serverless driver (`@neondatabase/serverless`)
- Drizzle ORM for type-safe database queries
- Schema definitions in `shared/schema.ts`
- Migrations directory: `./migrations`

**Rationale for Current Approach**:
- LocalStorage provides immediate functionality without backend dependencies
- Storage abstraction allows easy migration to database backend
- Shared schema types ensure consistency between client and future server implementation

**Migration Path**:
- Storage interface (`IStorage`) already defined for easy adapter swapping
- When backend is implemented, can switch from LocalStorage to API calls
- Drizzle configuration ready for PostgreSQL integration

### Key Feature Modules

**Food Management**:
- CRUD operations for food items with nutritional data
- Barcode scanning via `html5-qrcode` library
- OpenFoodFacts API integration for product lookup
- Category-based organization with favorites
- Drag-and-drop reordering capability

**Meal Planning**:
- Composite meal builder from food ingredients
- Weekly calendar with drag-and-drop meal assignment
- Meal scoring algorithm based on nutritional balance
- Shopping list generation from weekly meal plan

**Food Diary**:
- Daily food intake logging with drag-drop reordering
- Nutritional goal tracking with progress visualization
- Daily score calculation
- Copy functionality (from past days, from meal plans)
- "Copy from Past" feature to copy meals from previous days
- "Clear Day" button to remove all items from daily diary

**Health Tracking**:
- Water intake monitoring with reminder system
- Weight, glucose, and insulin logging with date-based tracking
- Historical data visualization

**Shopping Lists**:
- Smart shopping list generation from weekly meal calendar
- Intelligent merging of duplicate ingredients with quantity aggregation
- Category-based grouping for better organization
- Shopping list creation from individual meals

**Meal Planning**:
- Drag-drop weekly meal assignment with enhanced UX
- Visual feedback for drag operations
- Meal reordering in daily diary with drag-drop

**Analytics & Statistics**:
- 7-day nutrient trend visualization
- Macro distribution pie chart
- Hydration tracking chart
- Weekly consistency bar chart
- Summary cards (average calories, water, days tracked)

**Gamification**:
- Badge/achievement system
- Streak tracking (consecutive day logging)
- Nutritional goal challenges
- Meal/day scoring (A+ to F grading)

**Internationalization**:
- Multi-language support (Italian primary, English secondary)
- Translation system via `client/src/lib/i18n.ts`
- Language context provider for app-wide access

### External Dependencies

**Third-Party UI Libraries**:
- Radix UI component primitives (17+ packages for dialogs, dropdowns, etc.)
- Recharts for data visualization (pie charts, line charts)
- date-fns for date manipulation and formatting
- Lucide React for iconography
- Embla Carousel for touch-friendly carousels

**Barcode & Product Data**:
- `html5-qrcode` for camera-based barcode scanning
- OpenFoodFacts API (external service, no authentication) for product nutritional data lookup

**Development Tools**:
- Vite for development server and build tooling
- TypeScript for type safety
- Tailwind CSS with PostCSS for styling
- ESLint configuration (implied by modern React setup)

**Backend Dependencies** (configured but not fully utilized):
- Drizzle ORM for database operations
- Neon serverless PostgreSQL driver
- Connect-pg-simple for session storage (configured but unused)
- Zod for runtime validation via drizzle-zod

**Build & Deployment**:
- Replit-specific plugins for development (`@replit/vite-plugin-*`)
- esbuild for server bundling in production
- Express for serving static assets and API routes

**Database Service**:
- Neon (PostgreSQL serverless) - connection configured via `DATABASE_URL` environment variable
- Not currently active but infrastructure ready for migration from LocalStorage