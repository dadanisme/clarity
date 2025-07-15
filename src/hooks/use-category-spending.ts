import { useMemo } from "react";
import type { Transaction, Category } from "@/types";
import type { CategorySpending } from "@/components/dashboard/overview/types";

export function useCategorySpending(
  transactions: Transaction[],
  previousPeriodTransactions: Transaction[],
  categories: Category[]
) {
  const categorySpending = useMemo(() => {
    // Group current period transactions by category
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions.forEach((transaction) => {
      const existing = categoryMap.get(transaction.categoryId) || {
        amount: 0,
        count: 0,
      };
      categoryMap.set(transaction.categoryId, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
      });
    });

    // Group previous period transactions by category
    const prevCategoryMap = new Map<string, { amount: number; count: number }>();

    previousPeriodTransactions.forEach((transaction) => {
      const existing = prevCategoryMap.get(transaction.categoryId) || {
        amount: 0,
        count: 0,
      };
      prevCategoryMap.set(transaction.categoryId, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
      });
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Convert to CategorySpending array with previous period comparison
    const allCategories: CategorySpending[] = Array.from(categoryMap.entries())
      .map(([categoryId, { amount, count }]) => {
        const category = categories.find((c) => c.id === categoryId);
        const prevData = prevCategoryMap.get(categoryId) || { amount: 0, count: 0 };
        
        const hasData = prevData.amount > 0;
        const percentageChange = hasData
          ? ((amount - prevData.amount) / prevData.amount) * 100
          : 0;

        return {
          categoryId,
          name: category?.name || "Unknown",
          color: category?.color || "#6B7280",
          amount,
          percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
          transactionCount: count,
          previousAmount: prevData.amount,
          percentageChange,
          hasData,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Group smallest categories until they reach approximately 5% of total
    if (allCategories.length > 1) {
      let cumulativePercentage = 0;
      const othersCategories: CategorySpending[] = [];
      const keepIndividual: CategorySpending[] = [];

      // Start from the smallest (end of sorted array) and accumulate until ~5%
      for (let i = allCategories.length - 1; i >= 0; i--) {
        const category = allCategories[i];

        if (
          cumulativePercentage + category.percentage <= 5 &&
          othersCategories.length < allCategories.length - 1
        ) {
          othersCategories.push(category);
          cumulativePercentage += category.percentage;
        } else {
          keepIndividual.unshift(category);
        }
      }

      // Only create "Others" if we have multiple small categories to group
      if (othersCategories.length > 1) {
        const othersAmount = othersCategories.reduce(
          (sum, cat) => sum + cat.amount,
          0
        );
        const othersCount = othersCategories.reduce(
          (sum, cat) => sum + cat.transactionCount,
          0
        );
        const othersPreviousAmount = othersCategories.reduce(
          (sum, cat) => sum + cat.previousAmount,
          0
        );

        const othersHasData = othersPreviousAmount > 0;
        const othersPercentageChange = othersHasData
          ? ((othersAmount - othersPreviousAmount) / othersPreviousAmount) * 100
          : 0;

        const othersCategory: CategorySpending = {
          categoryId: "others",
          name: "Others",
          color: "#9CA3AF",
          amount: othersAmount,
          percentage: totalSpent > 0 ? (othersAmount / totalSpent) * 100 : 0,
          transactionCount: othersCount,
          previousAmount: othersPreviousAmount,
          percentageChange: othersPercentageChange,
          hasData: othersHasData,
        };

        return [...keepIndividual, othersCategory].sort(
          (a, b) => b.amount - a.amount
        );
      }
    }

    return allCategories;
  }, [transactions, previousPeriodTransactions, categories]);

  const actualTopCategories = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions.forEach((transaction) => {
      const existing = categoryMap.get(transaction.categoryId) || {
        amount: 0,
        count: 0,
      };
      categoryMap.set(transaction.categoryId, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
      });
    });

    // Group previous period transactions by category
    const prevCategoryMap = new Map<string, { amount: number; count: number }>();

    previousPeriodTransactions.forEach((transaction) => {
      const existing = prevCategoryMap.get(transaction.categoryId) || {
        amount: 0,
        count: 0,
      };
      prevCategoryMap.set(transaction.categoryId, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
      });
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    return Array.from(categoryMap.entries())
      .map(([categoryId, { amount, count }]) => {
        const category = categories.find((c) => c.id === categoryId);
        const prevData = prevCategoryMap.get(categoryId) || { amount: 0, count: 0 };
        
        const hasData = prevData.amount > 0;
        const percentageChange = hasData
          ? ((amount - prevData.amount) / prevData.amount) * 100
          : 0;

        return {
          categoryId,
          name: category?.name || "Unknown",
          color: category?.color || "#6B7280",
          amount,
          percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
          transactionCount: count,
          previousAmount: prevData.amount,
          percentageChange,
          hasData,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, previousPeriodTransactions, categories]);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    categorySpending,
    actualTopCategories,
    totalSpent,
  };
}