import { Tables } from "./database";

export type { Database } from "./database";

// Main table types from Supabase
export type User = Tables<"users">;
export type Category = Tables<"categories">;
export type Transaction = Tables<"transactions">;
export type FeatureSubscription = Tables<"feature_subscriptions">;

// Enhanced types for relationships
export type TransactionWithCategory = Transaction & {
  categories: Category;
};

export type CategoryWithCount = Category & {
  count: number;
};

export type UserWithFeatures = User & {
  feature_subscriptions: FeatureSubscription[];
};

// Enums for better type safety
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export enum FeatureSubscriptionStatus {
  ACTIVE = "active",
  REVOKED = "revoked",
}

export enum FeatureFlag {
  AI_RECEIPT_SCANNING = "ai_receipt_scanning",
  EXCEL_IMPORT = "excel_import",
  EXCEL_EXPORT = "excel_export",
}

// Summary types for analytics
export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategorySummary {
  category_id: string;
  category: Category;
  total: number;
  count: number;
}
