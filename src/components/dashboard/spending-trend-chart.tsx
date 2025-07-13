"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface DailySpending {
  date: Date;
  amount: number;
}

interface SpendingTrendChartProps {
  dailySpending: DailySpending[];
  maxDailySpending: number;
  expenses: number;
}

export function SpendingTrendChart({ dailySpending, maxDailySpending, expenses }: SpendingTrendChartProps) {
  if (expenses === 0) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          Daily Spending Trend
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your spending pattern this month
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32 gap-1">
            {dailySpending.slice(0, 15).map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-muted rounded-t transition-all duration-300 hover:bg-primary/20"
                  style={{
                    height: `${Math.max((day.amount / maxDailySpending) * 100, 2)}%`,
                    minHeight: day.amount > 0 ? '4px' : '2px'
                  }}
                  title={`${format(day.date, 'MMM d')}: ${formatCurrency(day.amount)}`}
                />
                <span className="text-xs text-muted-foreground mt-1">
                  {format(day.date, 'd')}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start of month</span>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}