# CLAUDE.md - Clarity Money Management Monorepo

## Project Overview

Clarity is a modern money management Progressive Web App (PWA) built with a Turborepo monorepo structure to enable code sharing between web and mobile platforms. The project uses Next.js 15, TypeScript, Supabase, and Tailwind CSS with shared business logic across platforms.

## Monorepo Structure

```
money-management/
├── turbo.json                    # Turborepo configuration
├── package.json                  # Root package.json with workspace config
├── tsconfig.json                 # Root TypeScript project references
├── .gitignore                    # Monorepo gitignore
├── README.md                     # Monorepo documentation
├── apps/
│   ├── web/                     # Next.js web application
│   │   ├── package.json         # Web app dependencies
│   │   ├── CLAUDE.md            # Web-specific instructions
│   │   ├── next.config.ts
│   │   ├── supabase/            # Supabase migrations and config
│   │   └── src/                 # Web app source code
│   └── mobile/                  # Future React Native app
└── packages/
    ├── shared/                  # Shared business logic
    │   ├── package.json
    │   ├── src/
    │   │   ├── services/        # Supabase services
    │   │   ├── utils/           # Utility functions
    │   │   ├── stores/          # Zustand stores
    │   │   └── validations/     # Zod schemas
    │   └── tsconfig.json
    ├── types/                   # Shared TypeScript types
    │   ├── package.json
    │   ├── src/
    │   │   ├── database.ts      # Supabase generated types
    │   │   ├── index.ts         # Core types
    │   │   ├── receipt.ts       # Receipt types
    │   │   └── next-pwa.d.ts    # PWA types
    │   └── tsconfig.json
    └── config/                  # Shared configurations
        ├── package.json
        ├── src/
        │   ├── eslint/
        │   ├── typescript/
        │   └── tailwind/
        └── tsconfig.json
```

## Tech Stack

- **Monorepo**: Turborepo for build orchestration and caching
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: TanStack Query, Zustand, React Hook Form
- **Validation**: Zod schemas (shared across platforms)
- **AI Integration**: Google Generative AI for receipt parsing
- **PWA**: @ducanh2912/next-pwa
- **Package Manager**: npm with workspaces

## Development Commands

### Root Monorepo Commands

```bash
# Install all dependencies
npm install

# Development (starts all apps)
npm run dev

# Build all packages
npm run build

# Type check all packages
npm run typecheck

# Lint all packages
npm run lint

# Clean all build artifacts
npm run clean
```

### App-Specific Commands

```bash
# Run only web app
npm run dev --filter=@clarity/web

# Build only web app
npm run build --filter=@clarity/web

# Type check only shared package
npm run typecheck --filter=@clarity/shared
```

### Web App Commands (from apps/web/)

```bash
# Development server (runs on port 1010 with Turbopack)
npm run dev

# Type checking (run before coding/committing)
npx tsc --noEmit

# Lint check (run before coding/committing)
npm run lint

# Production build
npm run build

# Start production server
npm start

# Supabase commands
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
npm run supabase:gen-types  # Generates types to packages/types/src/database.ts
npm run dev:supabase        # Start both Supabase and dev server
```

## Package Details

### @clarity/web (apps/web/)
The Next.js web application containing:
- React components (UI, auth, dashboard, transactions, etc.)
- Next.js specific functionality (API routes, SSR, pages)
- PWA configuration
- Web-specific hooks and providers
- Supabase client/server setup

**Dependencies**: Uses `@clarity/shared` and `@clarity/types`

### @clarity/shared (packages/shared/)
Shared business logic across platforms:
- **Services**: Supabase operations (auth, categories, transactions, features, users)
- **Utils**: Date utilities, Excel import/export, receipt parsing, category mapping
- **Stores**: Zustand stores (auth, timeframe)
- **Validations**: Zod schemas for forms and data validation

**Key exports**:
- `AuthService`, `CategoriesService`, `TransactionsService`
- `categoryMapper`, `excelExporter`, `receiptUtils`
- `authStore`, `timeframeStore`
- `transactionSchema`, `categorySchema`

### @clarity/types (packages/types/)
Shared TypeScript types:
- **Database types**: Auto-generated from Supabase schema
- **Core types**: User, Transaction, Category with relationships
- **Enums**: UserRole, Theme, FeatureFlag, etc.
- **Form types**: Inferred from Zod schemas
- **Receipt types**: AI parsing structures

**Key exports**:
- Database types from Supabase
- Enhanced types with relationships
- Type-safe enums
- Summary and analytics types

### @clarity/config (packages/config/)
Shared configuration files:
- **TypeScript**: Base tsconfig for all packages
- **ESLint**: Shared linting rules
- **Tailwind**: Shared styling configuration

## Import Patterns

### In Web App (apps/web/)
```typescript
// Types
import { User, Transaction, TransactionWithCategory } from '@clarity/types';
import { Database } from '@clarity/types/database';

// Shared services and utilities
import { AuthService, CategoriesService } from '@clarity/shared/services';
import { categoryMapper, dateUtils } from '@clarity/shared/utils';
import { authStore } from '@clarity/shared/stores';
import { transactionSchema } from '@clarity/shared/validations';

// Local imports
import { Button } from '@/components/ui/button';
```

### In Shared Package (packages/shared/)
```typescript
// Cross-package imports
import { User, Transaction, Category } from '@clarity/types';
import { Database } from '@clarity/types/database';

// Internal imports
import { supabase } from './config';
import { categoryMapper } from '../utils/category-mapper';
```

## Development Guidelines

### Daily Workflow

1. **Before coding**: Run `npm run typecheck` and `npm run lint` from root
2. **During coding**: Fix TypeScript errors immediately across all packages
3. **Before committing**: Run both checks again from root and ensure they pass
4. **File size check**: Keep individual files under 200 lines

### Pre-Development Checklist

- Always run `npm run typecheck` and `npm run lint` from root before starting work
- Ensure Supabase local development is running (from apps/web)
- Check that all environment variables are properly configured
- Verify you're on the correct git branch
- Pull latest changes from main branch

### Monorepo Best Practices

#### Code Organization
- **Shared logic**: Place in `packages/shared` if used by multiple apps
- **Types**: Always define in `packages/types` for cross-platform consistency
- **App-specific code**: Keep in respective app directories
- **Configuration**: Share common configs in `packages/config`

#### Package Dependencies
- Use workspace references (`"@clarity/types": "*"`) for internal packages
- Keep external dependencies in the package that actually uses them
- Move shared dependencies to root `package.json` only if used by all packages
- Avoid circular dependencies between packages

#### Import Guidelines
- **Always use absolute imports** for cross-package dependencies
- **Use relative imports** for internal package files
- **Prefer named exports** over default exports for better tree-shaking
- **Keep import paths consistent** across all packages

### TypeScript Guidelines

- **Never use `any` type** - Always define proper types in `@clarity/types`
- Use strict TypeScript configuration across all packages
- Leverage type references for monorepo structure
- Always type function parameters and return values explicitly
- Use proper paths configuration for package resolution

### Adding New Packages

1. Create package directory: `packages/new-package/`
2. Add `package.json` with proper naming: `@clarity/new-package`
3. Configure `tsconfig.json` with monorepo paths
4. Add to root `tsconfig.json` references
5. Update Turborepo configuration if needed

### Adding New Apps

1. Create app directory: `apps/new-app/`
2. Add `package.json` with dependencies on shared packages
3. Configure TypeScript with monorepo paths
4. Import shared business logic and types
5. Add app-specific Turborepo tasks if needed

## Environment Variables

### Root (.env.local)
```env
# Shared across all apps
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### App-specific (.env.local in apps/web/)
```env
# Web app specific
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_secret
```

## Deployment

### Pre-Deployment Checklist

1. Run full type check: `npm run typecheck`
2. Run linting: `npm run lint`
3. Test build locally: `npm run build`
4. Verify all environment variables are set
5. Test critical user flows in web app
6. Check Supabase RLS policies are properly configured

### Building for Production

```bash
# Build all packages in correct order
npm run build

# Build only web app
npm run build --filter=@clarity/web
```

### Platform-Specific Deployments

- **Web**: Deploy `apps/web` to Vercel/Netlify
- **Mobile**: Build `apps/mobile` with React Native CLI (future)
- **Shared packages**: Automatically included in app builds

## Common Tasks

### Updating Shared Types

1. Update database schema in Supabase
2. Run: `cd apps/web && npm run supabase:gen-types`
3. Types are automatically generated to `packages/types/src/database.ts`
4. All apps using `@clarity/types` get updated types

### Adding Shared Business Logic

1. Add logic to appropriate `packages/shared/src/` directory
2. Export from relevant index files
3. Import in apps using `@clarity/shared/[category]`

### Adding New Features

1. Define types in `packages/types`
2. Implement business logic in `packages/shared`
3. Add UI components in app-specific directories
4. Import and use shared logic in components

## Migration Benefits

### Before (Single Next.js App)
- Code duplication when adding mobile
- Tight coupling between UI and business logic
- Difficult to maintain consistency across platforms
- Complex dependency management

### After (Turborepo Monorepo)
- **Code Reuse**: Shared business logic, types, and utilities
- **Type Safety**: Centralized types ensure consistency
- **Developer Experience**: Single command to run/build all apps
- **Scalability**: Easy to add new platforms
- **Maintenance**: Changes to shared logic apply to all apps
- **Performance**: Turborepo caching and parallel execution

## Troubleshooting

### Common Issues

#### Build Errors
- Check package dependencies are properly installed: `npm install`
- Verify TypeScript paths are correctly configured
- Ensure all imports use correct package names

#### Type Errors
- Run `npm run typecheck` to see all type issues across packages
- Check that `@clarity/types` is properly imported
- Verify database types are up to date

#### Import Resolution
- Check `tsconfig.json` paths configuration
- Verify package names match exactly
- Ensure packages are listed in workspace dependencies

#### Development Server Issues
- Start from correct directory (`apps/web` for web app)
- Check that Supabase is running for full functionality
- Verify environment variables are set in correct locations

### Performance Optimization

- Use Turborepo caching: builds and type checks are cached
- Run tasks in parallel: `npm run typecheck` runs across all packages
- Filter commands: use `--filter` for specific packages
- Incremental builds: only rebuild changed packages

## Future Enhancements

### Planned Additions
- **React Native mobile app** in `apps/mobile/`
- **Shared UI components** in `packages/ui/`
- **Testing utilities** in `packages/test-utils/`
- **CLI tools** in `apps/cli/`

### Architecture Improvements
- Component library for cross-platform UI consistency
- Shared testing infrastructure
- Automated dependency updates
- Enhanced build caching strategies

---

This monorepo structure positions Clarity for multi-platform development while maintaining code quality, type safety, and developer productivity.