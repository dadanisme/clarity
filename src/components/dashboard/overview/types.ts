import type { Transaction, Category } from "@/types";

export interface CategoryAnalysisProps {
  transactions: Transaction[];
  previousPeriodTransactions: Transaction[];
  categories: Category[];
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  previousAmount: number;
  percentageChange: number;
  hasData: boolean;
}