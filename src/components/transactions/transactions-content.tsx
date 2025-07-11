"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/providers/auth-provider";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useTransactionGroups } from "@/hooks/use-transaction-groups";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionGroup } from "@/components/transactions/transaction-group";
import { TimeframeControls } from "@/components/transactions/timeframe-controls";
import { Plus } from "lucide-react";

export function TransactionsContent() {
  const { user } = useAuth();
  const { data: transactions = [], isLoading } = useTransactions(
    user?.id || ""
  );
  const { data: categories = [] } = useCategories(user?.id || "");
  const {
    timeframe,
    setTimeframe,
    currentPeriod,
    sortedGroups,
    goToPrevious,
    goToNext,
    setCurrentPeriod,
  } = useTransactionGroups(transactions);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#6b7280";
  };

  const handleDelete = (transactionId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete transaction:", transactionId);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentPeriod(date);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-end mb-6">
        <TransactionForm
          mode="create"
          trigger={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          }
        />
      </div>

      {/* Timeframe Control */}
      <Card className="mb-6">
        <CardContent>
          <TimeframeControls
            timeframe={timeframe}
            currentPeriod={currentPeriod}
            onTimeframeChange={setTimeframe}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onDateSelect={handleDateSelect}
          />
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Your complete transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Add your first transaction to get started!
            </div>
          ) : (
            <div className="space-y-6">
              {sortedGroups.map(([groupKey, groupTransactions]) => (
                <TransactionGroup
                  key={groupKey}
                  groupKey={groupKey}
                  groupTransactions={groupTransactions}
                  timeframe={timeframe}
                  getCategoryName={getCategoryName}
                  getCategoryColor={getCategoryColor}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
