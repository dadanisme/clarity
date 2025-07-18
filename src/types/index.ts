export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system"
}

export interface User {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  profile_image?: string;
  theme: Theme;
  created_at: string;
  updated_at: string;
  role_updated_by?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: "income" | "expense";
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCategory extends Transaction {
  categories: Category;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategorySummary {
  categoryId: string;
  category: Category;
  total: number;
  count: number;
}

export enum FeatureSubscriptionStatus {
  ACTIVE = "active",
  REVOKED = "revoked"
}

export enum FeatureFlag {
  AI_RECEIPT_SCANNING = "ai_receipt_scanning",
  EXCEL_IMPORT = "excel_import"
}

export interface FeatureSubscription {
  id: string;
  user_id: string;
  feature_flag: FeatureFlag;
  feature_name: string;
  status: FeatureSubscriptionStatus;
  granted_at: string;
  granted_by: string;
  revoked_by?: string;
  revoked_at?: string;
  notes?: string;
}