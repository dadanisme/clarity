import { useState, useMemo } from "react";
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

export function useTransactionGroups(transactions: Transaction[]) {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [currentPeriod, setCurrentPeriod] = useState(new Date());

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

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentPeriod);
    switch (timeframe) {
      case "daily":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "weekly":
        newDate.setMonth(newDate.getMonth() - 3); // Previous quarter
        break;
      case "monthly":
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setCurrentPeriod(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentPeriod);
    switch (timeframe) {
      case "daily":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "weekly":
        newDate.setMonth(newDate.getMonth() + 3); // Next quarter
        break;
      case "monthly":
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setCurrentPeriod(newDate);
  };

  const goToToday = () => {
    setCurrentPeriod(new Date());
  };

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
