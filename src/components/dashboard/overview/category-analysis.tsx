"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import type { Transaction, Category } from "@/types";

interface CategoryAnalysisProps {
  transactions: Transaction[];
  categories: Category[];
}

interface CategorySpending {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export function CategoryAnalysis({ transactions, categories }: CategoryAnalysisProps) {
  const categorySpending = useMemo(() => {
    // Group transactions by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    transactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.categoryId) || { amount: 0, count: 0 };
      categoryMap.set(transaction.categoryId, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      });
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Convert to CategorySpending array
    const result: CategorySpending[] = Array.from(categoryMap.entries())
      .map(([categoryId, { amount, count }]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          name: category?.name || "Unknown",
          color: category?.color || "#6B7280",
          amount,
          percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
          transactionCount: count
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return result;
  }, [transactions, categories]);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const topCategories = categorySpending.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Category Breakdown Chart */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            Category Breakdown
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your spending by category
          </p>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-4">
              {/* Simple progress bars instead of pie chart for now */}
              <div className="space-y-3">
                {topCategories.map((category) => (
                  <div key={category.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {formatCurrency(category.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {categorySpending.length > 5 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Showing top 5 categories out of {categorySpending.length} total
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Categories List */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            Top Categories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your highest spending categories
          </p>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No category data</p>
              <p className="text-sm text-muted-foreground">
                Add transactions with categories to see insights
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topCategories.map((category) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-destructive">
                      {formatCurrency(category.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}