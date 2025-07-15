"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Calculator, Receipt, Hash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useTimeframeStore } from "@/lib/stores/timeframe-store";
import { useMemo } from "react";
import type { Transaction } from "@/types";
import type { TimeframeType } from "@/lib/stores/timeframe-store";

interface OverviewSummaryCardsProps {
  transactions: Transaction[];
  timeframe: TimeframeType;
}

export function OverviewSummaryCards({ transactions, timeframe }: OverviewSummaryCardsProps) {
  const { currentPeriod, getDateRange } = useTimeframeStore();
  
  // Calculate current period metrics
  const currentPeriodMetrics = useMemo(() => {
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = transactions.length;
    const biggestTransaction = transactions.reduce((max, t) => 
      t.amount > max ? t.amount : max, 0
    );
    
    // Calculate average based on timeframe
    let average = 0;
    const { startDate, endDate } = getDateRange();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (timeframe) {
      case "daily":
        average = totalSpent / daysDiff;
        break;
      case "weekly":
        average = totalSpent / (daysDiff / 7);
        break;
      case "monthly":
        average = totalSpent / (daysDiff / 30);
        break;
    }
    
    return {
      totalSpent,
      transactionCount,
      biggestTransaction,
      average
    };
  }, [transactions, timeframe, getDateRange]);

  // Get period label
  const getPeriodLabel = () => {
    switch (timeframe) {
      case "daily":
        return format(currentPeriod, "MMMM yyyy");
      case "weekly":
        return `Q${Math.floor(currentPeriod.getMonth() / 3) + 1} ${currentPeriod.getFullYear()}`;
      case "monthly":
        return currentPeriod.getFullYear().toString();
    }
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Spent
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(currentPeriodMetrics.totalSpent)}
          </div>
          <p className="text-xs text-muted-foreground">
            {getPeriodLabel()}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Spending
          </CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(currentPeriodMetrics.average)}
          </div>
          <p className="text-xs text-muted-foreground">
            {getAverageLabel()}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Biggest Transaction
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(currentPeriodMetrics.biggestTransaction)}
          </div>
          <p className="text-xs text-muted-foreground">
            Single transaction
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Transactions
          </CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {currentPeriodMetrics.transactionCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Total count
          </p>
        </CardContent>
      </Card>
    </div>
  );
}