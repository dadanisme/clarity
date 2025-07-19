"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCategorySpending } from "@/hooks/use-category-spending";
import { CategoryPieChart } from "./category-pie-chart";
import { TopCategoriesList } from "./top-categories-list";
import type { CategoryAnalysisProps } from "./types";

export function CategoryAnalysis({
  transactions,
  previousPeriodTransactions,
  categories,
}: CategoryAnalysisProps) {
  const { categorySpending, actualTopCategories, totalSpent } = useCategorySpending(
    transactions,
    previousPeriodTransactions,
    categories
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-primary">
          Category Breakdown
        </h2>
        <p className="text-sm text-muted-foreground">
          Your spending by category
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          {totalSpent === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">No spending data</p>
                <p className="text-sm text-muted-foreground">
                  Start adding transactions to see your category breakdown
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <CategoryPieChart data={categorySpending} />

              {/* Top 5 Categories List */}
              <TopCategoriesList categories={actualTopCategories} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
