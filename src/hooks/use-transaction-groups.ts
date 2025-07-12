import { useMemo } from "react";
import {
  format,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import { Transaction } from "@/types";
import { useTimeframeStore } from "@/lib/stores/timeframe-store";

export function useTransactionGroups(transactions: Transaction[]) {
  const {
    timeframe,
    currentPeriod,
    setTimeframe,
    setCurrentPeriod,
    goToPrevious,
    goToNext,
    goToToday,
  } = useTimeframeStore();

  // Since transactions are now pre-filtered by date range from Firebase,
  // we don't need additional filtering here
  const filteredTransactions = transactions;

  // Group filtered transactions by timeframe
  const sortedGroups = useMemo(() => {
    const groupedTransactions = filteredTransactions.reduce(
      (groups, transaction) => {
        let groupKey: string;

        switch (timeframe) {
          case "daily":
            groupKey = format(transaction.date, "yyyy-MM-dd");
            break;
          case "weekly":
            groupKey = format(
              startOfWeek(transaction.date, { weekStartsOn: 1 }),
              "yyyy-MM-dd"
            );
            break;
          case "monthly":
            groupKey = format(startOfMonth(transaction.date), "yyyy-MM");
            break;
          default:
            groupKey = format(transaction.date, "yyyy-MM-dd");
        }

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(transaction);
        return groups;
      },
      {} as Record<string, typeof filteredTransactions>
    );

    // Sort groups by date (newest first)
    return Object.entries(groupedTransactions).sort(([a], [b]) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [filteredTransactions, timeframe]);


  return {
    timeframe,
    setTimeframe,
    currentPeriod,
    setCurrentPeriod,
    sortedGroups,
    goToPrevious,
    goToNext,
    goToToday,
  };
}
