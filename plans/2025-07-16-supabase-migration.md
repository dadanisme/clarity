# Clarity Money Management - Supabase Migration Plan

**Date:** July 16, 2025  
**Status:** Draft  
**Estimated Timeline:** 2-3 weeks  

## Executive Summary

This document outlines the comprehensive migration plan from Firebase to Supabase for the Clarity money management application. The migration will transform the current Firebase-based architecture to leverage Supabase's PostgreSQL database, authentication system, and real-time capabilities while maintaining all existing features and functionality.

## Current Firebase Architecture

### Services Used
- **Firebase Auth:** Email/password authentication with Google provider
- **Firestore:** NoSQL database with nested subcollections
- **Security Rules:** Role-based access control
- **Real-time Listeners:** Live data synchronization via onSnapshot
- **Emulator Suite:** Local development environment

### Image Handling
- **Base64 encoding:** Profile images and receipts stored as base64 strings
- **No persistent storage:** Images processed in-memory for AI parsing
- **No Cloud Storage:** Currently not using Firebase Storage or any file storage service

### Data Structure
```
users/{userId}
├── categories/{categoryId}
├── transactions/{transactionId}
└── subscriptions/{featureId}
```

### Key Features
- User management with roles (User/Admin)
- Complex feature flagging system
- Real-time data synchronization
- Admin interface for user management
- AI-powered receipt parsing (base64 images)
- Excel import functionality
- Profile image upload (base64 storage)

## Migration Strategy

### Incremental Migration Approach
This migration follows a **zero-downtime, module-by-module approach** to ensure the application remains fully functional throughout the process. Each module is migrated independently while maintaining compatibility with existing Firebase modules.

### Phase 1: Foundation Setup (3 days)
- Set up Supabase project and database schema
- Configure authentication and security policies
- Create migration utilities and abstraction layers

### Phase 2: User Authentication (2 days)
- Migrate authentication system first (foundation for all other modules)
- Implement user migration and mapping
- Ensure seamless login/signup experience

### Phase 3: Incremental Module Migration (8 days)
**Day 1-2: Categories Module**
- Migrate categories service to Supabase
- Update categories hooks and components
- Test categories functionality while other modules remain on Firebase

**Day 3-4: Transactions Module**
- Migrate transactions service to Supabase
- Update transaction hooks and components
- Ensure overview dashboard continues working with new transaction data

**Day 5-6: Feature Subscriptions Module**
- Migrate feature flagging system to Supabase
- Update admin interface and feature gates
- Test feature access controls

**Day 7-8: Real-time Subscriptions**
- Replace Firebase onSnapshot with Supabase real-time
- Update all real-time listeners module by module
- Ensure smooth data synchronization

### Phase 4: Firebase Cleanup (1 day)
- Remove Firebase dependencies
- Clean up unused code and configurations
- Final testing and validation

### Phase 5: Testing & Validation (2-3 days)
- Comprehensive end-to-end testing
- Performance validation
- User acceptance testing

## Detailed Migration Plan

### 1. Foundation Setup & Database Schema Design

#### Tables Structure

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE, -- For migration mapping
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  profile_image TEXT,
  settings JSONB DEFAULT '{"theme": "system"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role_updated_by UUID REFERENCES users(id)
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature subscriptions table
CREATE TABLE feature_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_flag TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID NOT NULL REFERENCES users(id),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES users(id),
  notes TEXT,
  UNIQUE(user_id, feature_flag)
);
```

#### Indexes for Performance

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_role ON users(role);

-- Category indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- Transaction indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);

-- Feature subscription indexes
CREATE INDEX idx_feature_subscriptions_user_id ON feature_subscriptions(user_id);
CREATE INDEX idx_feature_subscriptions_feature_flag ON feature_subscriptions(feature_flag);
CREATE INDEX idx_feature_subscriptions_status ON feature_subscriptions(status);
```

### 2. Authentication Migration

#### Supabase Auth Setup

```typescript
// lib/supabase/config.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### User Migration Strategy

1. **Export Firebase users** with their UIDs
2. **Create migration script** to populate Supabase users table
3. **Update authentication flows** to use Supabase Auth
4. **Implement user mapping** during transition period

```typescript
// lib/supabase/auth-service.ts
import { supabase } from './config'

export class AuthService {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  static async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })
    
    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}
```

### 3. Row Level Security (RLS) Policies

Convert Firebase Security Rules to PostgreSQL RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = firebase_uid OR 
                   EXISTS (SELECT 1 FROM users WHERE firebase_uid = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Users can create own account" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = firebase_uid)
  WITH CHECK (auth.uid()::text = firebase_uid);

CREATE POLICY "Admins can update user roles" ON users
  FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE firebase_uid = auth.uid()::text AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE firebase_uid = auth.uid()::text AND role = 'admin'));

-- Categories policies
CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::text));

-- Transactions policies
CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::text));

-- Feature subscriptions policies
CREATE POLICY "Users can read own subscriptions" ON feature_subscriptions
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::text));

CREATE POLICY "Admins can manage all subscriptions" ON feature_subscriptions
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE firebase_uid = auth.uid()::text AND role = 'admin'));
```

### 4. Service Abstraction Layer

Create an abstraction layer to allow gradual migration without breaking existing functionality:

```typescript
// lib/database/database-adapter.ts
export interface DatabaseAdapter {
  getCategories(userId: string): Promise<Category[]>
  createCategory(userId: string, data: any): Promise<Category>
  updateCategory(categoryId: string, data: any): Promise<Category>
  deleteCategory(categoryId: string): Promise<void>
  
  getTransactions(userId: string, options?: any): Promise<Transaction[]>
  createTransaction(userId: string, data: any): Promise<Transaction>
  updateTransaction(transactionId: string, data: any): Promise<Transaction>
  deleteTransaction(transactionId: string): Promise<void>
  
  subscribeToCategories(userId: string, callback: (data: any) => void): () => void
  subscribeToTransactions(userId: string, callback: (data: any) => void): () => void
}

// lib/database/firebase-adapter.ts
export class FirebaseAdapter implements DatabaseAdapter {
  // Current Firebase implementations
}

// lib/database/supabase-adapter.ts  
export class SupabaseAdapter implements DatabaseAdapter {
  // New Supabase implementations
}

// lib/database/index.ts
import { FirebaseAdapter } from './firebase-adapter'
import { SupabaseAdapter } from './supabase-adapter'

// Feature flags for gradual migration
const USE_SUPABASE_CATEGORIES = process.env.NEXT_PUBLIC_USE_SUPABASE_CATEGORIES === 'true'
const USE_SUPABASE_TRANSACTIONS = process.env.NEXT_PUBLIC_USE_SUPABASE_TRANSACTIONS === 'true'
const USE_SUPABASE_FEATURES = process.env.NEXT_PUBLIC_USE_SUPABASE_FEATURES === 'true'

export const categoriesAdapter = USE_SUPABASE_CATEGORIES ? new SupabaseAdapter() : new FirebaseAdapter()
export const transactionsAdapter = USE_SUPABASE_TRANSACTIONS ? new SupabaseAdapter() : new FirebaseAdapter()
export const featuresAdapter = USE_SUPABASE_FEATURES ? new SupabaseAdapter() : new FirebaseAdapter()
```

### 5. Incremental Module Migration

#### Categories Module Migration

```typescript
// hooks/use-categories.ts (Updated to use adapter)
import { categoriesAdapter } from '@/lib/database'

export function useCategories() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: () => categoriesAdapter.getCategories(user!.id),
    enabled: !!user
  })

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: any) => categoriesAdapter.createCategory(user!.id, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] })
    }
  })

  return {
    categories: categoriesQuery.data || [],
    loading: categoriesQuery.isLoading,
    createCategory: createCategoryMutation.mutate
  }
}
```

#### Transactions Module Migration

```typescript
// hooks/use-transactions.ts (Updated to use adapter)
import { transactionsAdapter } from '@/lib/database'

export function useTransactions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const transactionsQuery = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => transactionsAdapter.getTransactions(user!.id),
    enabled: !!user
  })

  // Overview dashboard will continue to work seamlessly
  // because it uses the same hook interface
  
  return {
    transactions: transactionsQuery.data || [],
    loading: transactionsQuery.isLoading,
    createTransaction: (data: any) => transactionsAdapter.createTransaction(user!.id, data)
  }
}
```

### 6. Real-time Subscriptions Migration

Replace Firebase onSnapshot with Supabase real-time subscriptions:

```typescript
// lib/supabase/realtime-service.ts
import { supabase } from './config'

export class RealtimeService {
  static subscribeToUserData(userId: string, callback: (data: any) => void) {
    return supabase
      .from('users')
      .on('UPDATE', { filter: `id=eq.${userId}` }, callback)
      .subscribe()
  }

  static subscribeToCategories(userId: string, callback: (data: any) => void) {
    return supabase
      .from('categories')
      .on('*', { filter: `user_id=eq.${userId}` }, callback)
      .subscribe()
  }

  static subscribeToTransactions(userId: string, callback: (data: any) => void) {
    return supabase
      .from('transactions')
      .on('*', { filter: `user_id=eq.${userId}` }, callback)
      .subscribe()
  }

  static subscribeToFeatureSubscriptions(userId: string, callback: (data: any) => void) {
    return supabase
      .from('feature_subscriptions')
      .on('*', { filter: `user_id=eq.${userId}` }, callback)
      .subscribe()
  }
}
```

### 5. Service Layer Migration

#### Categories Service

```typescript
// lib/supabase/categories-service.ts
import { supabase } from './config'
import { Category } from '@/types'

export class CategoriesService {
  static async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createCategory(userId: string, categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...categoryData, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCategory(categoryId: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCategory(categoryId: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw error
  }
}
```

#### Transactions Service

```typescript
// lib/supabase/transactions-service.ts
import { supabase } from './config'
import { Transaction } from '@/types'

export class TransactionsService {
  static async getTransactions(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (options?.startDate) {
      query = query.gte('date', options.startDate.toISOString())
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate.toISOString())
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async createTransaction(userId: string, transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transactionData, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTransaction(transactionId: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTransaction(transactionId: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) throw error
  }
}
```

### 6. Feature Service Migration

```typescript
// lib/supabase/feature-service.ts
import { supabase } from './config'
import { FeatureFlag, FeatureSubscription } from '@/types'

export class FeatureService {
  static async hasFeature(userId: string, feature: FeatureFlag): Promise<boolean> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('feature_flag', feature)
      .single()

    if (error) return false
    return data?.status === 'active'
  }

  static async getUserFeatures(userId: string): Promise<FeatureSubscription[]> {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  }

  static async grantFeature(
    userId: string,
    feature: FeatureFlag,
    grantedBy: string,
    featureName: string,
    notes?: string
  ) {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .upsert([{
        user_id: userId,
        feature_flag: feature,
        feature_name: featureName,
        status: 'active',
        granted_by: grantedBy,
        notes
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async revokeFeature(userId: string, feature: FeatureFlag, revokedBy: string) {
    const { data, error } = await supabase
      .from('feature_subscriptions')
      .update({
        status: 'revoked',
        revoked_by: revokedBy,
        revoked_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('feature_flag', feature)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

### 7. Hooks Migration

#### useAuth Hook

```typescript
// hooks/use-auth.ts
import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/supabase/auth-service'
import { UserService } from '@/lib/supabase/user-service'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        const userData = await UserService.getUser(authUser.id)
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

#### useCategories Hook

```typescript
// hooks/use-categories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoriesService } from '@/lib/supabase/categories-service'
import { useAuth } from './use-auth'

export function useCategories() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: () => CategoriesService.getCategories(user!.id),
    enabled: !!user
  })

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: any) => CategoriesService.createCategory(user!.id, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] })
    }
  })

  return {
    categories: categoriesQuery.data || [],
    loading: categoriesQuery.isLoading,
    createCategory: createCategoryMutation.mutate
  }
}
```

### 7. Migration Environment Variables

Add environment variables for gradual migration control:

```env
# .env.local
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase configuration (keep during migration)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Migration control flags
NEXT_PUBLIC_USE_SUPABASE_CATEGORIES=false
NEXT_PUBLIC_USE_SUPABASE_TRANSACTIONS=false
NEXT_PUBLIC_USE_SUPABASE_FEATURES=false

# AI service (unchanged)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### 8. Migration Process Steps

#### Step 1: Categories Migration
1. Set `NEXT_PUBLIC_USE_SUPABASE_CATEGORIES=true`
2. Test categories functionality
3. Verify overview dashboard still works (uses transactions from Firebase)
4. Confirm admin features remain functional

#### Step 2: Transactions Migration  
1. Set `NEXT_PUBLIC_USE_SUPABASE_TRANSACTIONS=true`
2. Test transactions functionality
3. **Critical:** Verify overview dashboard works with new transaction data
4. Ensure receipt parsing continues to work
5. Test Excel import functionality

#### Step 3: Features Migration
1. Set `NEXT_PUBLIC_USE_SUPABASE_FEATURES=true`
2. Test admin interface
3. Verify feature gates work correctly
4. Test user role management

#### Step 4: Firebase Cleanup
1. Remove Firebase dependencies from package.json
2. Delete Firebase configuration
3. Clean up unused Firebase code
4. Remove migration environment variables

### 9. Rollback Strategy

If issues arise during migration, rollback is simple:
1. Set the problematic module flag back to `false`
2. Application immediately uses Firebase for that module
3. Other migrated modules continue using Supabase
4. No data loss or downtime

### 10. Environment Variables (Final State)

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### 9. Package Dependencies

Update package.json:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2"
  }
}
```

Remove Firebase dependencies:
```bash
npm uninstall firebase
```

### 11. Development Environment

#### Local Development Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in project
supabase init

# Start local Supabase (runs alongside Firebase emulators)
supabase start

# Apply migrations
supabase db push
```

#### Dual Database Development

During migration, you'll run both Firebase and Supabase locally:

```bash
# Terminal 1: Start Firebase emulators
npm run emulators

# Terminal 2: Start Supabase
supabase start

# Terminal 3: Start Next.js development server
npm run dev
```

Your application will use both databases simultaneously based on the feature flags.

#### Database Migrations

```sql
-- migrations/001_initial_schema.sql
-- (Include all the CREATE TABLE statements from above)

-- migrations/002_seed_data.sql
-- Insert default categories and admin user
```

## Migration Checklist

### Pre-Migration
- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Create database schema
- [ ] Set up RLS policies
- [ ] Test local Supabase environment

### Data Migration
- [ ] Export Firebase data
- [ ] Create data migration scripts
- [ ] Test data migration on staging
- [ ] Validate data integrity

### Incremental Code Migration
- [ ] Create database abstraction layer
- [ ] Implement Firebase and Supabase adapters
- [ ] **Categories Module:**
  - [ ] Migrate categories service
  - [ ] Update categories hooks
  - [ ] Test categories functionality
  - [ ] Verify overview dashboard still works
- [ ] **Transactions Module:**
  - [ ] Migrate transactions service
  - [ ] Update transaction hooks
  - [ ] Test transactions functionality
  - [ ] Verify overview dashboard with new data
- [ ] **Features Module:**
  - [ ] Migrate feature service
  - [ ] Update admin interface
  - [ ] Test feature gates
- [ ] **Real-time Subscriptions:**
  - [ ] Replace Firebase onSnapshot
  - [ ] Implement Supabase real-time
  - [ ] Test live data updates

### Testing
- [ ] Unit tests for all services
- [ ] Integration tests
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing

### Deployment
- [ ] Deploy to staging
- [ ] Run migration scripts
- [ ] Validate all features
- [ ] Deploy to production
- [ ] Monitor for issues

## Risks and Mitigation

### Technical Risks
1. **Module Incompatibility During Migration**
   - Mitigation: Database abstraction layer, feature flag rollback

2. **Data Synchronization Issues**
   - Mitigation: Thorough testing between modules, data validation

3. **Performance Degradation**
   - Mitigation: Proper indexing, query optimization, monitoring

4. **Authentication Conflicts**
   - Mitigation: User mapping strategy, gradual migration

4. **Real-time Subscription Failures**
   - Mitigation: Fallback to polling, comprehensive testing

### User Experience Risks
1. **User Re-authentication Required**
   - Mitigation: Clear communication, seamless onboarding

2. **Temporary Service Disruption**
   - Mitigation: Planned maintenance window, quick rollback plan

## Success Metrics

- [ ] All existing features working correctly
- [ ] Performance equal to or better than Firebase
- [ ] Zero data loss during migration
- [ ] User authentication seamless
- [ ] Real-time features functioning
- [ ] Admin features operational

## Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 3 days | Foundation setup and database schema |
| Phase 2 | 2 days | Authentication migration |
| Phase 3 | 2 days | Categories module migration |
| Phase 4 | 2 days | Transactions module migration |
| Phase 5 | 2 days | Features module migration |
| Phase 6 | 2 days | Real-time subscriptions migration |
| Phase 7 | 1 day | Firebase cleanup |
| Phase 8 | 2-3 days | Final testing and validation |
| **Total** | **16-17 days** | **Complete incremental migration** |

## Post-Migration Tasks

1. **Monitoring and Alerting**
   - Set up Supabase monitoring
   - Configure error tracking
   - Monitor performance metrics

2. **Documentation Updates**
   - Update README.md
   - Update CLAUDE.md
   - Create new development guides

3. **Team Training**
   - Supabase best practices
   - New development workflows
   - Troubleshooting guides

4. **Optimization**
   - Query performance tuning
   - Index optimization
   - Cache strategy review

## Conclusion

This migration plan provides a comprehensive roadmap for transitioning from Firebase to Supabase while maintaining all existing functionality. The phased approach minimizes risks and ensures a smooth transition with proper testing and validation at each step.

**Image Handling Note:** The current base64 image storage approach will continue to work seamlessly with Supabase. No changes required for profile images or receipt processing. This can optionally be upgraded to Supabase Storage in the future if persistent file storage is desired.

**Migration Benefits:**
- **Zero-downtime migration:** Each module migrates independently
- **Instant rollback capability:** Feature flags allow immediate revert to Firebase
- **Reduced risk:** Gradual migration with continuous validation
- **Better TypeScript support:** Auto-generated types from Supabase
- **More powerful querying:** SQL-based queries and joins
- **Cost-effective pricing:** More transparent and scalable pricing model
- **Improved developer experience:** Better tooling and documentation
- **Simplified architecture:** No Cloud Storage complexity

With this incremental approach, the migration minimizes risks while maintaining full application functionality throughout the process. The abstraction layer ensures smooth transitions and easy rollback if needed.