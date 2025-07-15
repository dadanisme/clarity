"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { 
  format, 
  eachDayOfInterval, 
  eachWeekOfInterval, 
  eachMonthOfInterval,
  isSameDay,
  isSameWeek,
  isSameMonth
} from "date-fns";
import { useTimeframeStore } from "@/lib/stores/timeframe-store";
import type { Transaction } from "@/types";
import type { TimeframeType } from "@/lib/stores/timeframe-store";

interface SpendingTrendsProps {
  transactions: Transaction[];
  timeframe: TimeframeType;
}


export function SpendingTrends({ transactions, timeframe }: SpendingTrendsProps) {
  const { getDateRange } = useTimeframeStore();
  
  const chartData = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    
    switch (timeframe) {
      case "daily": {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        return days.map(day => {
          const dayAmount = transactions
            .filter(t => isSameDay(t.date, day))
            .reduce((sum, t) => sum + t.amount, 0);
          
          return {
            date: day,
            amount: dayAmount,
            label: format(day, "MMM d")
          };
        });
      }
      case "weekly": {
        const weeks = eachWeekOfInterval({ start: startDate, end: endDate });
        return weeks.map(week => {
          const weekAmount = transactions
            .filter(t => isSameWeek(t.date, week))
            .reduce((sum, t) => sum + t.amount, 0);
          
          return {
            date: week,
            amount: weekAmount,
            label: format(week, "MMM d")
          };
        });
      }
      case "monthly": {
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        return months.map(month => {
          const monthAmount = transactions
            .filter(t => isSameMonth(t.date, month))
            .reduce((sum, t) => sum + t.amount, 0);
          
          return {
            date: month,
            amount: monthAmount,
            label: format(month, "MMM")
          };
        });
      }
    }
  }, [transactions, timeframe, getDateRange]);

  const maxAmount = Math.max(...chartData.map(d => d.amount), 0);
  const totalSpent = chartData.reduce((sum, d) => sum + d.amount, 0);

  // Helper function to format currency in short format
  const formatCurrencyShort = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    } else {
      return amount.toFixed(0);
    }
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case "daily":
        return "Daily Spending";
      case "weekly":
        return "Weekly Spending";
      case "monthly":
        return "Monthly Spending";
    }
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          {getTimeframeLabel()}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your spending pattern over time
        </p>
      </CardHeader>
      <CardContent>
        {totalSpent === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No spending data</p>
              <p className="text-sm text-muted-foreground">
                Start adding transactions to see your spending trend
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-32 text-xs text-muted-foreground w-12 text-right">
                <span>{formatCurrencyShort(maxAmount)}</span>
                <span>{formatCurrencyShort(maxAmount * 0.75)}</span>
                <span>{formatCurrencyShort(maxAmount * 0.5)}</span>
                <span>{formatCurrencyShort(maxAmount * 0.25)}</span>
                <span>0</span>
              </div>
              
              {/* Chart bars */}
              <div className="flex items-end justify-between h-32 gap-1 flex-1">
                {chartData.slice(0, 15).map((dataPoint, index) => (
                  <div
                    key={index}
                    className="flex justify-end flex-col items-center flex-1 h-full group"
                  >
                    <div
                      className="w-full h-full bg-primary/80 rounded-t transition-all duration-300 hover:bg-primary cursor-pointer relative"
                      style={{
                        height: `${Math.max(
                          maxAmount > 0 ? (dataPoint.amount / maxAmount) * 100 : 0,
                          2
                        )}%`,
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        <div className="font-medium">{dataPoint.label}</div>
                        <div>{formatCurrency(dataPoint.amount)}</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 truncate">
                      {dataPoint.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {chartData.length > 15 && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Showing first 15 data points out of {chartData.length} total
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}