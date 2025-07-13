"use client";

import { format, startOfWeek } from "date-fns";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Transaction, Category } from "@/types";

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
        <div className="text-xs text-muted-foreground">
          {groupTransactions.length} transaction
          {groupTransactions.length !== 1 ? "s" : ""}
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
