"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

// Helper function to format currency in short format
function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  } else {
    return amount.toFixed(0);
  }
}

interface DailySpending {
  date: Date;
  amount: number;
}

interface SpendingTrendChartProps {
  dailySpending: DailySpending[];
}

export function SpendingTrendChart({ dailySpending }: SpendingTrendChartProps) {
  const expenses = useMemo(() => {
    return dailySpending.reduce((sum, day) => sum + day.amount, 0);
  }, [dailySpending]);

  const maxDailySpending = useMemo(() => {
    return Math.max(...dailySpending.map((day) => day.amount), 0);
  }, [dailySpending]);

  // Use the actual maximum daily spending for better scale proportions
  const chartMaxValue = maxDailySpending * 1.2;

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
          <div className="flex gap-2">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between h-32 text-xs text-muted-foreground w-12 text-right">
              <span>{formatCurrencyShort(chartMaxValue)}</span>
              <span>{formatCurrencyShort(chartMaxValue * 0.75)}</span>
              <span>{formatCurrencyShort(chartMaxValue * 0.5)}</span>
              <span>{formatCurrencyShort(chartMaxValue * 0.25)}</span>
              <span>0</span>
            </div>
            {/* Chart bars */}
            <div className="flex items-end justify-between h-32 gap-1 flex-1">
              {expenses === 0
                ? // Show empty state with placeholder bars
                  Array.from({ length: 15 }, (_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-full bg-muted/30 rounded-t"
                        style={{
                          height: "2px",
                          minHeight: "2px",
                        }}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        {index + 1}
                      </span>
                    </div>
                  ))
                : dailySpending.slice(0, 15).map((day, index) => (
                    <div
                      key={index}
                      className="flex justify-end flex-col items-center flex-1 h-full"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="w-full h-full bg-primary/80 rounded-t transition-all duration-300 hover:bg-primary cursor-pointer"
                            style={{
                              height: `${Math.max(
                                (day.amount / chartMaxValue) * 100,
                                2
                              )}%`,
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center">
                            <div className="font-medium">{format(day.date, "MMM d, yyyy")}</div>
                            <div className="text-sm">{formatCurrency(day.amount)}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-xs text-muted-foreground mt-1">
                        {format(day.date, "d")}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start of month</span>
            <span>Today</span>
          </div>
          {expenses === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No spending data yet. Start adding transactions to see your
                spending trend.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
