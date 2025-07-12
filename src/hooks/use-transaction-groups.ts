import { useMemo } from "react";
import {
  format,
  startOfWeek,
  startOfMonth,
  isSameMonth,
  isSameYear,
  startOfQuarter,
  endOfQuarter,
  isWithinInterval,
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

  // Filter transactions based on current period and timeframe
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      switch (timeframe) {
        case "daily":
          // Show transactions from the selected month
          return (
            isSameMonth(transaction.date, currentPeriod) &&
            isSameYear(transaction.date, currentPeriod)
          );
        case "weekly":
          // Show transactions from the selected quarter
          const quarterStart = startOfQuarter(currentPeriod);
          const quarterEnd = endOfQuarter(currentPeriod);
          return isWithinInterval(transaction.date, {
            start: quarterStart,
            end: quarterEnd,
          });
        case "monthly":
          // Show transactions from the selected year
          return isSameYear(transaction.date, currentPeriod);
        default:
          return true;
      }
    });
  }, [transactions, timeframe, currentPeriod]);

  // Group filtered transactions by timeframe
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
  const sortedGroups = Object.entries(groupedTransactions).sort(([a], [b]) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });


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
