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
  displayName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  createdAt: Date;
  settings: {
    theme: Theme;
  };
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  createdAt: Date;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
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
  userId: string;
  featureName: string;
  status: FeatureSubscriptionStatus;
  grantedAt: Date;
  grantedBy: string;
  revokedBy?: string;
  revokedAt?: Date;
  notes?: string;
}
