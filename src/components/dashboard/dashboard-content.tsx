"use client";

import { useAuth } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
} from "date-fns";
import { SummaryCards } from "./summary-cards";
import { SpendingTrendChart } from "./spending-trend-chart";
import { RecentTransactions } from "./recent-transactions";
import { EmptyState } from "./empty-state";

export function DashboardContent() {
  const { user } = useAuth();
  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions(user?.id || "");
  const { data: categories = [] } = useCategories(user?.id || "");

  const currentMonth = format(new Date(), "yyyy-MM");
  const monthlyTransactions = transactions.filter(
    (t) => format(t.date, "yyyy-MM") === currentMonth
  );

  const income = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  // Calculate previous month for comparison
  const previousMonth = format(subMonths(new Date(), 1), "yyyy-MM");
  const previousMonthTransactions = transactions.filter(
    (t) => format(t.date, "yyyy-MM") === previousMonth
  );
  const previousExpenses = previousMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Generate daily spending data for current month
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dailySpending = daysInMonth.map((day) => {
    const dayTransactions = transactions.filter(
      (t) =>
        t.type === "expense" &&
        format(t.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );
    return {
      date: day,
      amount: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
    };
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8">
      <SummaryCards
        balance={balance}
        expenses={expenses}
        income={income}
        previousExpenses={previousExpenses}
      />

      <SpendingTrendChart dailySpending={dailySpending} />

      <RecentTransactions transactions={transactions} categories={categories} />

      <EmptyState
        isLoading={transactionsLoading}
        hasTransactions={transactions.length > 0}
      />
    </div>
  );
}
