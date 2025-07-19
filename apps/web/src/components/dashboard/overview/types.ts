import type { Transaction, Category } from "@clarity/types";

export interface CategoryAnalysisProps {
  transactions: Transaction[];
  previousPeriodTransactions: Transaction[];
  categories: Category[];
}

export interface CategorySpending {
  category_id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  previousAmount: number;
  percentageChange: number;
  hasData: boolean;
}
