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

### Phase 1: Database Schema Design (3 days)
Convert Firestore's nested document structure to PostgreSQL relational tables.

### Phase 2: Authentication Migration (2 days)
Migrate from Firebase Auth to Supabase Auth.

### Phase 3: Security Implementation (3 days)
Convert Firebase Security Rules to Supabase Row Level Security (RLS) policies.

### Phase 4: Real-time Subscriptions (2 days)
Replace Firebase onSnapshot with Supabase real-time subscriptions.

### Phase 5: Code Migration (5 days)
Update all services, hooks, and components to use Supabase. Base64 image handling remains unchanged.

### Phase 6: Testing & Validation (2-3 days)
Comprehensive testing of all features and edge cases.

## Detailed Migration Plan

### 1. Database Schema Design

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

### 4. Real-time Subscriptions Migration

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

### 8. Environment Variables

Update environment variables for Supabase:

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

### 10. Development Environment

#### Local Development Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in project
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db push
```

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

### Code Migration
- [ ] Update authentication service
- [ ] Migrate database services
- [ ] Update hooks and components
- [ ] Replace real-time listeners
- [ ] Update feature service

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
1. **Data Loss During Migration**
   - Mitigation: Complete backup before migration, staged rollout

2. **Authentication Conflicts**
   - Mitigation: User mapping strategy, gradual migration

3. **Performance Issues**
   - Mitigation: Proper indexing, query optimization

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
| Phase 1 | 3 days | Database schema design and setup |
| Phase 2 | 2 days | Authentication migration |
| Phase 3 | 3 days | Security policies implementation |
| Phase 4 | 2 days | Real-time subscriptions |
| Phase 5 | 5 days | Code migration and refactoring |
| Phase 6 | 2-3 days | Testing and validation |
| **Total** | **17-18 days** | **Complete migration** |

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

The key benefits of this migration include:
- Better TypeScript support
- More powerful querying capabilities
- Cost-effective pricing
- Improved developer experience
- Better long-term maintainability
- Simplified architecture (no Cloud Storage complexity)

With careful execution of this plan, the migration should be completed successfully within the estimated timeline while maintaining high code quality and user experience standards.