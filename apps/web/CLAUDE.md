# CLAUDE.md - Clarity Money Management App

## Project Overview

Clarity is a modern money management Progressive Web App (PWA) built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. It features transaction tracking, category management, dashboard analytics, receipt parsing with AI, and cross-device synchronization.

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: TanStack Query, Zustand, React Hook Form
- **Validation**: Zod schemas
- **AI Integration**: Google Generative AI for receipt parsing
- **PWA**: @ducanh2912/next-pwa
- **Icons**: Lucide React

## Development Commands

### Core Commands

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
```

### Supabase Commands

```bash
# Start Supabase local development
npm run supabase:start

# Stop Supabase local development
npm run supabase:stop

# Reset local database
npm run supabase:reset

# Generate TypeScript types from database
npm run supabase:gen-types

# Start both Supabase and dev server concurrently
npm run dev:supabase
```

### Supabase Local Ports

- API: http://127.0.0.1:54321
- Database: http://127.0.0.1:54322
- Studio: http://127.0.0.1:54323
- Inbucket (Email): http://127.0.0.1:54324

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── signin/              # Sign in page
│   │   └── signup/              # Sign up page
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/               # Admin dashboard (desktop-only)
│   │   ├── overview/            # Dashboard overview
│   │   ├── settings/            # User settings
│   │   └── transactions/        # Transaction management
│   ├── api/                     # API routes
│   │   ├── delete-image/        # Image deletion endpoint
│   │   ├── parse-receipt/       # AI receipt parsing
│   │   └── upload-image/        # Image upload endpoint
│   ├── auth/                    # Auth callback handling
│   │   └── callback/            # Supabase auth callback
│   ├── categories/              # Category management
│   ├── offline/                 # PWA offline page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── admin/                   # Admin interface components
│   │   ├── desktop-only.tsx     # Mobile blocking component
│   │   ├── feature-selection.tsx # Feature management interface
│   │   ├── user-management.tsx  # User administration
│   │   └── user-table.tsx       # Admin user table
│   ├── auth/                    # Authentication components
│   │   ├── auth-guard.tsx       # Route protection
│   │   ├── auth-layout.tsx      # Auth page layout
│   │   ├── signin-form.tsx      # Sign in form
│   │   └── signup-form.tsx      # Sign up form
│   ├── categories/              # Category management
│   ├── dashboard/               # Dashboard components
│   │   └── overview/            # Overview specific components
│   │       ├── category-analysis.tsx # Category analytics
│   │       ├── category-pie-chart.tsx # Visual charts
│   │       └── overview-summary-cards.tsx # Summary statistics
│   ├── features/                # Feature flagging components
│   │   └── feature-gate.tsx     # Feature access control
│   ├── home/                    # Home page components
│   ├── layout/                  # Layout components
│   ├── pwa/                     # PWA-specific components
│   ├── settings/                # Settings components
│   ├── transactions/            # Transaction components
│   │   ├── excel-export.tsx     # Excel file export
│   │   ├── excel-import.tsx     # Excel file import
│   │   ├── receipt-*.tsx        # Receipt processing components
│   │   └── transaction-*.tsx    # Various transaction components
│   └── ui/                      # shadcn/ui components
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   ├── use-categories.ts        # Category management hook
│   ├── use-features.ts          # Feature flagging hooks
│   ├── use-image-upload.ts      # Image upload handling
│   ├── use-overview-data.ts     # Dashboard overview data
│   ├── use-receipt-parser.ts    # Receipt parsing logic
│   ├── use-settings.ts          # User settings hook
│   ├── use-transactions.ts      # Transaction management
│   └── use-users-management.ts  # Admin user management
├── lib/                         # Utilities and configurations
│   ├── database/                # Database schema and types
│   ├── providers/               # React context providers
│   ├── stores/                  # Zustand stores
│   │   ├── auth-store.ts        # Authentication state
│   │   └── timeframe-store.ts   # Time filtering state
│   ├── supabase/                # Supabase configuration and services
│   │   ├── auth-service.ts      # Authentication service
│   │   ├── categories-service.ts # Category operations
│   │   ├── client.ts            # Supabase client config
│   │   ├── feature-service.ts   # Feature flagging service
│   │   ├── server.ts            # Server-side client
│   │   ├── transactions-service.ts # Transaction operations
│   │   └── user-service.ts      # User management
│   ├── utils/                   # Helper functions
│   │   ├── category-*.ts        # Category utilities
│   │   ├── date-utils.ts        # Date formatting and manipulation
│   │   ├── excel-*.ts           # Excel import/export utilities
│   │   └── receipt-utils.ts     # Receipt processing utilities
│   └── validations/             # Zod validation schemas
└── types/                       # TypeScript type definitions
    ├── database.ts              # Supabase generated types
    ├── index.ts                 # Main type definitions
    ├── receipt.ts               # Receipt-related types
    └── next-pwa.d.ts           # PWA type definitions
```

## Key Features

### 1. Authentication System

- Supabase Authentication with email/password and Google OAuth
- Protected routes with auth guards
- User session management
- Role-based access control (User/Admin)

### 2. Feature Flagging System

- Granular feature access control per user
- Admin dashboard for feature management
- Feature gating for premium functionality
- Real-time feature status updates

### 3. Transaction Management

- CRUD operations for transactions
- Category assignment and filtering
- Excel import functionality (feature-gated)
- AI-powered receipt scanning and parsing (feature-gated)

### 4. Receipt Processing

- Image upload with file selection (no camera integration)
- Google Generative AI integration for parsing
- Automatic transaction creation from receipts
- Receipt item editing and validation
- Images processed as base64 (not stored persistently)

### 5. Category System

- Custom categories with colors and icons
- Category-based transaction filtering
- Category usage analytics

### 6. Dashboard Analytics

- Income/expense overview
- Balance calculations
- Time-based filtering
- Visual charts and statistics

### 7. Admin Management

- Desktop-only admin interface
- User role management (promote/demote)
- Feature access management per user
- User activity overview and analytics

### 8. PWA Features

- Offline functionality
- Install prompts
- Service worker implementation
- Mobile-optimized experience

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Google OAuth (optional)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_secret
```

## Supabase Configuration

### Row Level Security (RLS)

- User data isolation by user ID
- Role-based access control (User/Admin)
- Tables: users, categories, transactions, feature_subscriptions
- Feature subscription management (admin-only writes)
- Field-level validation and audit trails
- Admin privilege escalation prevention

### Local Development

- Auto-connects to local Supabase in development
- Database migrations and type generation
- Concurrent Supabase and dev server support

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- ESLint configuration with Next.js rules
- Tailwind CSS for styling
- shadcn/ui component library

### State Management

- TanStack Query for server state
- Zustand for client state (auth store, timeframe store)
- React Hook Form for form management

### Testing Approach

- Check README.md for testing commands
- Supabase local development for testing
- Use database migrations for consistent test scenarios
- Test components with realistic data, not just happy paths
- Verify error states and loading states
- Test RLS policies with different user contexts

### Adding Components

```bash
# Add new shadcn/ui components
npx shadcn@latest add <component-name>
```

## Best Practices

### Daily Workflow

1. **Before coding**: Run `npx tsc --noEmit` and `npm run lint`
2. **During coding**: Fix TypeScript errors immediately, don't accumulate them
3. **Before committing**: Run both checks again and ensure they pass
4. **File size check**: Ensure no file exceeds 200 lines

### Pre-Development Checklist

- Always run `npx tsc --noEmit` and `npm run lint` before starting work
- Ensure Supabase local development is running
- Check that all environment variables are properly configured
- Verify you're on the correct git branch
- Pull latest changes from main branch
- Review existing code patterns before implementing new features

### File Organization

- **Maximum 200 lines per file** - Split large files into smaller, focused modules
- Use descriptive file names that indicate their purpose
- Group related functionality in dedicated directories
- Keep components single-responsibility focused
- Prefer composition over inheritance
- Extract constants and configuration to separate files
- Use barrel exports (index.ts) for cleaner imports

### TypeScript Guidelines

- **Never use `any` type** - Always define proper types or use `unknown`
- Use strict TypeScript configuration
- Define interfaces and types in dedicated files when shared
- Leverage union types and type guards for type safety
- Use generic types for reusable components and utilities
- Prefer `interface` over `type` for object shapes
- Use `const assertions` for immutable data
- Always type function parameters and return values explicitly

### Code Quality Checks

- **Always run type checking**: `npx tsc --noEmit`
- **Always run linting**: `npm run lint`
- **Pre-commit workflow**: Run both checks before every commit
- Fix all TypeScript errors before committing
- Address all ESLint warnings and errors
- Use proper error boundaries for React components
- Consider adding pre-commit hooks with husky for automated checks

### Component Best Practices

- Use TypeScript interfaces for all component props
- Implement proper error handling with try-catch blocks
- Use loading states for async operations
- Validate all user inputs with Zod schemas
- Keep components pure and predictable
- Extract custom hooks for complex logic
- Use React.forwardRef when component needs to expose DOM ref
- Implement proper cleanup in useEffect (return cleanup functions)

### Performance Guidelines

- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Avoid inline object/array creation in render methods
- Use useMemo and useCallback appropriately
- Optimize bundle size with dynamic imports

### Security Practices

- Never expose sensitive data in client-side code
- Validate all inputs on both client and server
- Use Supabase RLS policies for data protection
- Sanitize user-generated content
- Keep API keys secure in environment variables

### Git Workflow

- Create feature branches from main: `git checkout -b feature/description`
- Commit messages should be descriptive and follow conventional commits
- Always run `npx tsc --noEmit && npm run lint` before committing
- Squash commits when merging to keep history clean
- Never commit with TypeScript errors or lint warnings

### Troubleshooting

- **TypeScript errors**: Run `npx tsc --noEmit` to see all type issues
- **Lint errors**: Run `npm run lint -- --fix` to auto-fix formatting issues
- **Build failures**: Check environment variables and dependencies
- **Supabase connection**: Verify local development is running and env vars are set
- **PWA issues**: Clear browser cache and check service worker registration

## Common Tasks

### Starting Development

1. Install dependencies: `npm install`
2. Set up environment variables (copy from `.env.example`)
3. Run initial type check: `npx tsc --noEmit`
4. Run initial lint check: `npm run lint`
5. Start Supabase and dev server: `npm run dev:supabase`
6. Access app at http://localhost:1010
7. Access Supabase Studio at http://127.0.0.1:54323

### Building for Production

1. Run type check: `npx tsc --noEmit`
2. Run lint check: `npm run lint`
3. Build project: `npm run build`
4. Test production build: `npm start`

### Working with Receipts

- Upload images via file picker (no camera integration)
- AI parsing uses Google Generative AI (feature-gated)
- Images processed as base64 (not stored persistently)
- Manual editing of parsed items
- Category auto-mapping based on item descriptions

### Working with Feature Flags

- Admin users can grant/revoke features per user
- Features are stored in user subcollections
- Real-time feature access checking
- Feature gating with FeatureGate components
- Desktop-only admin interface

### Working with User Roles

- Two roles: User (default) and Admin
- Admins can promote/demote users
- Role changes are audited with timestamps
- Admins cannot change their own role

### Current Feature Flags Available

- **AI_SCAN**: AI-powered receipt scanning and parsing
- **EXCEL_IMPORT**: Excel file import functionality
- Features are defined in `/src/lib/supabase/feature-service.ts`
- Add new features by updating the FeatureFlag enum and FEATURE_METADATA

### Database Operations

- All data scoped to authenticated user
- Real-time updates via Supabase real-time subscriptions
- Optimistic updates with TanStack Query

## Deployment

### Pre-Deployment Checklist

1. Run full type check: `npx tsc --noEmit`
2. Run linting: `npm run lint`
3. Test build locally: `npm run build`
4. Verify all environment variables are set
5. Test critical user flows
6. Check Supabase RLS policies are properly configured

### Deployment Targets

- **Primary**: Vercel deployment
- Environment variables required in production
- Supabase project configuration needed
- PWA assets generated automatically
- Ensure proper Supabase project selection for production

## Important File Structure Updates

### New Admin Components

- `/src/app/(dashboard)/admin/page.tsx` - Admin dashboard (desktop-only)
- `/src/components/admin/user-table.tsx` - User management table with role changes
- `/src/components/admin/user-management.tsx` - Admin interface wrapper
- `/src/components/admin/desktop-only.tsx` - Mobile blocking component

### New Feature System

- `/src/components/features/feature-gate.tsx` - Feature access control components
- `/src/hooks/use-features.ts` - Feature flagging and admin hooks
- `/src/lib/supabase/feature-service.ts` - Feature management service
- `/src/lib/utils/date-utils.ts` - Date/timestamp utilities

### Updated Components

- `/src/components/ui/data-table.tsx` - Reusable data table component
- `/src/components/ui/image-upload.tsx` - Enhanced image upload component
- `/src/lib/supabase/user-service.ts` - Role management functions
- `/src/lib/supabase/auth-service.ts` - Authentication service
- `/src/lib/supabase/categories-service.ts` - Category operations
- `/src/lib/supabase/transactions-service.ts` - Transaction operations
- `/src/types/database.ts` - Supabase generated types
- `/src/types/index.ts` - Added UserRole, FeatureFlag, FeatureSubscription types

## Database Schema

### Core Tables

- **users**: User profiles with roles and authentication mapping
- **categories**: User-specific transaction categories
- **transactions**: User transaction records with category relationships
- **feature_subscriptions**: Admin-managed feature access control

### Key Relationships

- All user data is isolated by user_id foreign key
- Categories linked to transactions via category_id
- Feature subscriptions track admin grants/revokes with audit trail
- RLS policies enforce data isolation and role-based access

## Migration Notes

This project successfully migrated from Firebase to Supabase in July 2025. Key benefits include:

- **Better TypeScript support**: Auto-generated types from database schema
- **More powerful querying**: SQL-based queries and joins
- **Improved developer experience**: Better tooling and local development
- **Cost-effective pricing**: More transparent and scalable pricing model
- **Simplified architecture**: PostgreSQL vs NoSQL document store

The migration maintained all existing functionality while improving the developer experience and application architecture.