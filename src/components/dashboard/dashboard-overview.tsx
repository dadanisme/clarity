"use client";

import { useAuth } from "@/hooks/use-auth";
import { useOverviewData } from "@/hooks/use-overview-data";
import { useCategories } from "@/hooks/use-categories";
import { useTimeframeStore } from "@/lib/stores/timeframe-store";
import { TimeframeControls } from "@/components/transactions/timeframe-controls";
import { OverviewSummaryCards } from "./overview/overview-summary-cards";
import { CategoryAnalysis } from "./overview/category-analysis";
import { EmptyState } from "./empty-state";

export function DashboardOverview() {
  const { user } = useAuth();
  const { 
    currentPeriodTransactions, 
    previousPeriodTransactions,
    isLoading: transactionsLoading 
  } = useOverviewData(user?.id || "");
  const { data: categories = [] } = useCategories(user?.id || "");
  const { timeframe } = useTimeframeStore();

  // Filter to expense transactions only for spending analysis
  const expenseTransactions = currentPeriodTransactions.filter(t => t.type === "expense");

  const renderContent = () => {
    if (transactionsLoading) {
      return (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-2xl"></div>
          <div className="h-64 bg-muted rounded-2xl"></div>
        </div>
      );
    }

    if (expenseTransactions.length === 0) {
      return (
        <EmptyState
          isLoading={transactionsLoading}
          hasTransactions={currentPeriodTransactions.length > 0}
        />
      );
    }

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <OverviewSummaryCards
          currentPeriodTransactions={currentPeriodTransactions}
          previousPeriodTransactions={previousPeriodTransactions}
          timeframe={timeframe}
        />

        {/* Category Analysis */}
        <CategoryAnalysis
          transactions={expenseTransactions}
          categories={categories}
        />

      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header with Timeframe Controls - Always visible */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Spending Overview</h1>
          <p className="text-muted-foreground">
            Analyze your spending patterns and trends
          </p>
        </div>
        <TimeframeControls />
      </div>

      {/* Content that shows skeleton/empty state/data */}
      {renderContent()}
    </div>
  );
}