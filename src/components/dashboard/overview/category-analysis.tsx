"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
    const allCategories: CategorySpending[] = Array.from(categoryMap.entries())
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

    // Group smallest categories until they reach approximately 5% of total
    if (allCategories.length > 1) {
      let cumulativePercentage = 0;
      const othersCategories: CategorySpending[] = [];
      const keepIndividual: CategorySpending[] = [];

      // Start from the smallest (end of sorted array) and accumulate until ~5%
      for (let i = allCategories.length - 1; i >= 0; i--) {
        const category = allCategories[i];
        
        if (cumulativePercentage + category.percentage <= 5 && othersCategories.length < allCategories.length - 1) {
          othersCategories.push(category);
          cumulativePercentage += category.percentage;
        } else {
          keepIndividual.unshift(category);
        }
      }

      // Only create "Others" if we have multiple small categories to group
      if (othersCategories.length > 1) {
        const othersAmount = othersCategories.reduce((sum, cat) => sum + cat.amount, 0);
        const othersCount = othersCategories.reduce((sum, cat) => sum + cat.transactionCount, 0);
        
        const othersCategory: CategorySpending = {
          categoryId: "others",
          name: "Others",
          color: "#9CA3AF",
          amount: othersAmount,
          percentage: totalSpent > 0 ? (othersAmount / totalSpent) * 100 : 0,
          transactionCount: othersCount
        };

        return [...keepIndividual, othersCategory].sort((a, b) => b.amount - a.amount);
      }
    }

    return allCategories;
  }, [transactions, categories]);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Get actual top 5 categories (excluding "Others" for the list)
  const actualTopCategories = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    transactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.categoryId) || { amount: 0, count: 0 };
      categoryMap.set(transaction.categoryId, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      });
    });
    
    return Array.from(categoryMap.entries())
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
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, categories, totalSpent]);

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategorySpending }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <div className="font-medium">{data.name}</div>
          <div className="text-sm text-destructive font-bold">
            {formatCurrency(data.amount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {data.percentage.toFixed(1)}% of total
          </div>
        </div>
      );
    }
    return null;
  };

  return (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Categories List */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  Top 5 Categories
                </h4>
                <div className="space-y-3">
                  {actualTopCategories.map((category, index) => (
                    <div
                      key={category.categoryId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </div>
                        <div 
                          className="w-3 h-3 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-destructive">
                          {formatCurrency(category.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}