"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingDown,
  TrendingUp,
  Calculator,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTimeframeStore } from "@/lib/stores/timeframe-store";
import { useMemo } from "react";
import type { Transaction } from "@/types";
import type { TimeframeType } from "@/lib/stores/timeframe-store";

interface OverviewSummaryCardsProps {
  currentPeriodTransactions: Transaction[];
  previousPeriodTransactions: Transaction[];
  timeframe: TimeframeType;
}

interface PeriodComparison {
  current: number;
  previous: number;
  percentageChange: number;
  hasData: boolean;
}

export function OverviewSummaryCards({
  currentPeriodTransactions,
  previousPeriodTransactions,
  timeframe,
}: OverviewSummaryCardsProps) {
  const { getDateRange } = useTimeframeStore();

  // Calculate current period metrics with previous period comparison
  const currentPeriodMetrics = useMemo(() => {
    const { startDate, endDate } = getDateRange();

    // Calculate current period metrics
    const currentExpenses = currentPeriodTransactions.filter(
      (t) => t.type === "expense"
    );
    const currentIncome = currentPeriodTransactions.filter(
      (t) => t.type === "income"
    );

    const totalSpent = currentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = currentIncome.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = currentPeriodTransactions.length;
    const biggestExpense = currentExpenses.reduce(
      (max, t) => (t.amount > max ? t.amount : max),
      0
    );

    // Calculate previous period metrics
    const prevExpenses = previousPeriodTransactions.filter(
      (t) => t.type === "expense"
    );
    const prevIncome = previousPeriodTransactions.filter((t) => t.type === "income");

    const prevTotalSpent = prevExpenses.reduce((sum, t) => sum + t.amount, 0);
    const prevTotalIncome = prevIncome.reduce((sum, t) => sum + t.amount, 0);
    const prevBiggestExpense = prevExpenses.reduce(
      (max, t) => (t.amount > max ? t.amount : max),
      0
    );

    // Calculate average spending based on timeframe
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    let averageSpending = 0;
    let prevAverageSpending = 0;

    switch (timeframe) {
      case "daily":
        averageSpending = totalSpent / daysDiff;
        prevAverageSpending = prevTotalSpent / daysDiff;
        break;
      case "weekly":
        averageSpending = totalSpent / (daysDiff / 7);
        prevAverageSpending = prevTotalSpent / (daysDiff / 7);
        break;
      case "monthly":
        averageSpending = totalSpent / (daysDiff / 30);
        prevAverageSpending = prevTotalSpent / (daysDiff / 30);
        break;
    }

    // Helper function to calculate comparison
    const calculateComparison = (
      current: number,
      previous: number
    ): PeriodComparison => {
      const hasData = previous > 0;
      const percentageChange = hasData
        ? ((current - previous) / previous) * 100
        : 0;

      return {
        current,
        previous,
        percentageChange,
        hasData,
      };
    };

    return {
      totalSpent,
      totalIncome,
      transactionCount,
      biggestExpense,
      averageSpending,
      incomeComparison: calculateComparison(totalIncome, prevTotalIncome),
      expensesComparison: calculateComparison(totalSpent, prevTotalSpent),
      averageComparison: calculateComparison(
        averageSpending,
        prevAverageSpending
      ),
      biggestExpenseComparison: calculateComparison(
        biggestExpense,
        prevBiggestExpense
      ),
    };
  }, [currentPeriodTransactions, previousPeriodTransactions, timeframe, getDateRange]);


  // Get average label
  const getAverageLabel = () => {
    switch (timeframe) {
      case "daily":
        return "per day";
      case "weekly":
        return "per week";
      case "monthly":
        return "per month";
    }
  };

  // Helper component to render comparison
  const ComparisonIndicator = ({
    comparison,
    type,
  }: {
    comparison: PeriodComparison;
    type: "income" | "expense" | "neutral";
  }) => {
    if (!comparison.hasData) return null;

    const isPositive = comparison.percentageChange > 0;
    const isNegative = comparison.percentageChange < 0;
    
    // Determine if the change is good or bad based on type
    let isGood = false;
    if (type === "income") {
      isGood = isPositive; // Income increase = good
    } else if (type === "expense") {
      isGood = isNegative; // Expense decrease = good
    }

    return (
      <div
        className={`text-xs flex items-center gap-1 ${
          isGood
            ? "text-primary"
            : !isGood && (isPositive || isNegative)
            ? "text-destructive"
            : "text-muted-foreground"
        }`}
      >
        {isPositive && <TrendingUp className="w-3 h-3" />}
        {isNegative && <TrendingDown className="w-3 h-3" />}
        {Math.abs(comparison.percentageChange).toFixed(1)}%
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income & Expenses
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Income</span>
                <ComparisonIndicator
                  comparison={currentPeriodMetrics.incomeComparison}
                  type="income"
                />
              </div>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(currentPeriodMetrics.totalIncome)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <ComparisonIndicator
                  comparison={currentPeriodMetrics.expensesComparison}
                  type="expense"
                />
              </div>
              <div className="text-lg font-bold text-destructive">
                {formatCurrency(currentPeriodMetrics.totalSpent)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Spending Insights
          </CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Average {getAverageLabel()}
                </span>
                <ComparisonIndicator
                  comparison={currentPeriodMetrics.averageComparison}
                  type="expense"
                />
              </div>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(currentPeriodMetrics.averageSpending)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Biggest expense
                </span>
                <ComparisonIndicator
                  comparison={currentPeriodMetrics.biggestExpenseComparison}
                  type="expense"
                />
              </div>
              <div className="text-lg font-bold text-destructive">
                {formatCurrency(currentPeriodMetrics.biggestExpense)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total transactions
              </span>
              <div className="text-lg font-bold text-muted-foreground">
                {currentPeriodMetrics.transactionCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
