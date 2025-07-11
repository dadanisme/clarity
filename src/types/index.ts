export interface User {
  id: string;
  displayName: string;
  email: string;
  createdAt: Date;
  settings: {
    theme: "light" | "dark" | "system";
  };
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  createdAt: Date;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description: string;
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
