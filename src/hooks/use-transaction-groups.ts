import { useState } from "react";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { Transaction } from "@/types";

export function useTransactionGroups(transactions: Transaction[]) {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [currentPeriod, setCurrentPeriod] = useState(new Date());

  // Group transactions by timeframe
  const groupedTransactions = transactions.reduce((groups, transaction) => {
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
  }, {} as Record<string, typeof transactions>);

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
