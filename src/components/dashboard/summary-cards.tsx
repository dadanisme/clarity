"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
  balance: number;
  expenses: number;
  income: number;
  previousExpenses: number;
}

export function SummaryCards({ balance, expenses, income, previousExpenses }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Balance
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            balance >= 0 ? 'text-green-600' : 'text-destructive'
          }`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Spending This Month
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(expenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            {previousExpenses > 0 && (
              <span className={expenses > previousExpenses ? 'text-destructive' : 'text-green-600'}>
                {expenses > previousExpenses ? '+' : ''}
                {formatCurrency(expenses - previousExpenses)} vs last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income This Month
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(income)}
          </div>
          <p className="text-xs text-muted-foreground">Monthly income</p>
        </CardContent>
      </Card>
    </div>
  );
}