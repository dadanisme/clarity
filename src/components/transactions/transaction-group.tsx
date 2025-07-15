"use client";

import { format, startOfWeek } from "date-fns";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Transaction, Category } from "@/types";
import { formatCurrency, formatCurrencyShort } from "@/lib/utils";

interface TransactionGroupProps {
  groupKey: string;
  groupTransactions: Transaction[];
  timeframe: "daily" | "weekly" | "monthly";
  categories: Category[];
}

export function TransactionGroup({
  groupKey,
  groupTransactions,
  timeframe,
  categories,
}: TransactionGroupProps) {
  const getGroupTitle = (groupKey: string) => {
    const date = new Date(groupKey);

    switch (timeframe) {
      case "daily":
        return format(date, "EEEE, MMMM d, yyyy");
      case "weekly":
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${format(weekStart, "MMM d")} - ${format(
          weekEnd,
          "MMM d, yyyy"
        )}`;
      case "monthly":
        return format(date, "MMMM yyyy");
      default:
        return format(date, "EEEE, MMMM d, yyyy");
    }
  };

  const calculateTotals = () => {
    const income = groupTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = groupTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses };
  };

  const { income, expenses } = calculateTotals();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2">
        <TransactionForm
          mode="create"
          trigger={
            <div className="text-sm text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors">
              {getGroupTitle(groupKey)}
            </div>
          }
          defaultDate={new Date(groupKey)}
        />
        <div className="text-xs">
          <div className="flex items-center gap-4">
            {income > 0 && (
              <span className="text-green-600 dark:text-green-400">
                <span className="md:hidden">+{formatCurrencyShort(income)}</span>
                <span className="hidden md:inline">+{formatCurrency(income)}</span>
              </span>
            )}
            {expenses > 0 && (
              <span className="text-red-600 dark:text-red-400">
                <span className="md:hidden">-{formatCurrencyShort(expenses)}</span>
                <span className="hidden md:inline">-{formatCurrency(expenses)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {groupTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            categories={categories}
            showCategory={true}
            showDate={false}
            showEditButton={true}
            editTrigger={
              <TransactionForm
                transaction={transaction}
                mode="edit"
                trigger={
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <Edit className="w-4 h-4" />
                  </Button>
                }
              />
            }
            mobileEditOverlay={
              <TransactionForm
                transaction={transaction}
                mode="edit"
                trigger={
                  <div className="block md:hidden absolute inset-0 z-10" />
                }
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
