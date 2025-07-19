# Clarity Money Management Monorepo

A modern money management application built with Turborepo to enable code sharing between web and mobile platforms.

## Structure

```
money-management/
├── apps/
│   └── web/                 # Next.js web application
└── packages/
    ├── shared/              # Shared business logic
    ├── types/               # TypeScript type definitions
    └── config/              # Shared configurations
```

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm

### Installation

```bash
npm install
```

### Development

```bash
# Start all applications in development mode
npm run dev

# Start only the web application
npm run dev --filter=@clarity/web

# Type check all packages
npm run typecheck

# Lint all packages
npm run lint

# Build all packages
npm run build
```

### Working with Supabase

```bash
# Start Supabase and web app together
cd apps/web && npm run dev:supabase
```

## Package Overview

### @clarity/web
The Next.js web application with PWA capabilities, featuring:
- Transaction management
- Category management  
- Dashboard analytics
- AI receipt parsing
- Supabase integration

### @clarity/shared
Shared business logic including:
- Supabase services
- Utility functions
- Zustand stores
- Zod validation schemas

### @clarity/types
Shared TypeScript types:
- Database types (auto-generated from Supabase)
- Application types
- Receipt parsing types

### @clarity/config
Shared configuration files:
- TypeScript configurations
- ESLint configurations
- Tailwind CSS configurations

## Adding New Apps

To add a new application (e.g., React Native mobile app):

1. Create the app directory: `apps/mobile/`
2. Add the app to the root `package.json` workspaces
3. Install shared packages: `@clarity/shared` and `@clarity/types`
4. Import shared business logic and types

## Scripts

- `npm run dev` - Start all apps in development
- `npm run build` - Build all packages  
- `npm run typecheck` - Type check all packages
- `npm run lint` - Lint all packages
- `npm run clean` - Clean all build artifacts

## Architecture Benefits

- **Code Reuse**: Share business logic, types, and utilities across platforms
- **Type Safety**: Centralized TypeScript types ensure consistency  
- **Developer Experience**: Single command to run/build all apps
- **Scalability**: Easy to add new platforms (mobile, desktop, CLI tools)
- **Maintenance**: Changes to shared logic automatically apply to all apps