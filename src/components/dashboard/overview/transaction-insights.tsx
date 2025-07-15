"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format, getDay } from "date-fns";
import { useMemo } from "react";
import type { Transaction, Category } from "@/types";

interface TransactionInsightsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function TransactionInsights({ transactions, categories }: TransactionInsightsProps) {
  const expensiveTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [transactions]);

  const spendingPatterns = useMemo(() => {
    // Day of week analysis
    const daySpending = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
      amount: 0,
      count: 0
    }));

    transactions.forEach(transaction => {
      const dayOfWeek = getDay(transaction.date);
      daySpending[dayOfWeek].amount += transaction.amount;
      daySpending[dayOfWeek].count += 1;
    });

    // Sort by amount to find peak spending days
    const sortedDays = [...daySpending].sort((a, b) => b.amount - a.amount);
    
    return {
      daySpending: sortedDays,
      totalTransactions: transactions.length,
      averageTransactionAmount: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
        : 0
    };
  }, [transactions]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? `${category.icon} ${category.name}` : "Unknown";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expensive Transactions */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            Biggest Transactions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your highest spending transactions
          </p>
        </CardHeader>
        <CardContent>
          {expensiveTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No transactions</p>
              <p className="text-sm text-muted-foreground">
                Add transactions to see your biggest spends
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {expensiveTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {getCategoryName(transaction.categoryId)} • {format(transaction.date, "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-destructive">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Patterns */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            Spending Patterns
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            When you spend the most
          </p>
        </CardHeader>
        <CardContent>
          {spendingPatterns.totalTransactions === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No pattern data</p>
              <p className="text-sm text-muted-foreground">
                Add more transactions to see spending patterns
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Day of week breakdown */}
              <div>
                <h4 className="font-medium mb-3">Spending by Day of Week</h4>
                <div className="space-y-2">
                  {spendingPatterns.daySpending.slice(0, 7).map((day) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-20">{day.dayName}</span>
                        <div className="flex-1 max-w-32">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 bg-primary rounded-full transition-all duration-300"
                              style={{
                                width: `${spendingPatterns.daySpending[0].amount > 0 
                                  ? (day.amount / spendingPatterns.daySpending[0].amount) * 100 
                                  : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(day.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.count} transaction{day.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(spendingPatterns.averageTransactionAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Average per transaction
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-blue-600">
                      {spendingPatterns.totalTransactions}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total transactions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}