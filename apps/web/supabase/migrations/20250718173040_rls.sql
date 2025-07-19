-- Comprehensive Row Level Security policies for Clarity Money Management App
-- Designed to prevent infinite recursion and ensure proper data isolation

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin (prevents recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
-- Users can read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

-- Admins can read all users (using function to prevent recursion)
CREATE POLICY "users_select_admin" ON users
  FOR SELECT USING (is_admin());

-- Users can insert their own profile during registration
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own profile (excluding role changes)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND 
    role = (SELECT role FROM users WHERE id = auth.uid())
  );

-- Admins can update user roles (but not their own)
CREATE POLICY "users_update_roles_admin" ON users
  FOR UPDATE USING (is_admin() AND id != auth.uid())
  WITH CHECK (is_admin() AND id != auth.uid());

-- Categories table policies
-- Users can manage their own categories
CREATE POLICY "categories_all_own" ON categories
  FOR ALL USING (user_id = auth.uid());

-- Admins can read all categories
CREATE POLICY "categories_select_admin" ON categories
  FOR SELECT USING (is_admin());

-- Transactions table policies
-- Users can manage their own transactions
CREATE POLICY "transactions_all_own" ON transactions
  FOR ALL USING (user_id = auth.uid());

-- Admins can read all transactions
CREATE POLICY "transactions_select_admin" ON transactions
  FOR SELECT USING (is_admin());

-- Feature subscriptions table policies
-- Users can read their own feature subscriptions
CREATE POLICY "feature_subscriptions_select_own" ON feature_subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Admins can manage all feature subscriptions
CREATE POLICY "feature_subscriptions_all_admin" ON feature_subscriptions
  FOR ALL USING (is_admin());

-- Additional security constraints
-- Ensure users can only create categories for themselves
CREATE POLICY "categories_insert_own_user" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Ensure users can only create transactions for themselves and valid categories
CREATE POLICY "transactions_insert_own_user" ON transactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM categories WHERE id = category_id AND user_id = auth.uid())
  );

-- Ensure transaction updates maintain user ownership
CREATE POLICY "transactions_update_own_user" ON transactions
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM categories WHERE id = category_id AND user_id = auth.uid())
  );

-- Grant necessary permissions for RLS to work with auth
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;