-- Remove all Row Level Security policies and disable RLS
-- This migration removes all existing RLS policies without creating new ones

-- Drop all policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can create own account" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update user roles" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Drop all policies on categories table
DROP POLICY IF EXISTS "Users can manage own categories" ON categories;
DROP POLICY IF EXISTS "Admins can read all categories" ON categories;

-- Drop all policies on transactions table
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can read all transactions" ON transactions;

-- Drop all policies on feature_subscriptions table
DROP POLICY IF EXISTS "Users can read own subscriptions" ON feature_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON feature_subscriptions;

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_subscriptions DISABLE ROW LEVEL SECURITY;