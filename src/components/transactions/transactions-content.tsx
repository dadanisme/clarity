"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  useTransactions,
  useCreateTransaction,
} from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useTransactionGroups } from "@/hooks/use-transaction-groups";
import { createTransactionsFromReceipt } from "@/lib/utils/category-mapper";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionGroup } from "@/components/transactions/transaction-group";
import { TimeframeControls } from "@/components/transactions/timeframe-controls";
import { ExcelImport } from "@/components/transactions/excel-import";
import { ExcelExport } from "@/components/transactions/excel-export";
import { ReceiptParser } from "@/components/transactions/receipt-parser";
import { InlineFeatureGate } from "@/components/features/feature-gate";
import { FeatureFlag } from "@/types";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { TransactionSkeletonList } from "./transaction-skeleton-list";

export function TransactionsContent() {
  const { user } = useAuth();
  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useTransactions(user?.id || "");
  const { data: categories = [] } = useCategories(user?.id || "");
  const createTransaction = useCreateTransaction();

  const handleReceiptParsed = async (
    items: Array<{
      amount: number;
      discount: number | null;
      tax: number;
      serviceFee: number;
      category: string;
      description: string;
    }>,
    total: number,
    timestamp: string | null
  ) => {
    if (!user?.id) return;

    try {
      // Create transactions from receipt items
      const transactions = createTransactionsFromReceipt(
        items,
        categories,
        user.id
      );

      // If we have a timestamp, use it for the date
      if (timestamp) {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          transactions.forEach((t) => (t.date = date));
        }
      }

      // Create all transactions
      for (const transaction of transactions) {
        await createTransaction.mutateAsync({
          userId: user.id,
          data: transaction,
        });
      }
    } catch (error) {
      console.error("Failed to create transactions from receipt:", error);
    }
  };
  const { timeframe, currentPeriod, sortedGroups } =
    useTransactionGroups(transactions);

  const getEmptyStateMessage = () => {
    if (transactions.length === 0) {
      return "No transactions yet. Add your first transaction to get started!";
    }

    switch (timeframe) {
      case "daily":
        return `No transactions in ${format(
          currentPeriod,
          "MMMM yyyy"
        )}. Try selecting a different month or add a transaction for this period.`;
      case "weekly":
        const quarter = Math.floor(currentPeriod.getMonth() / 3) + 1;
        return `No transactions in Q${quarter} ${currentPeriod.getFullYear()}. Try selecting a different quarter or add a transaction for this period.`;
      case "monthly":
        return `No transactions in ${currentPeriod.getFullYear()}. Try selecting a different year or add a transaction for this period.`;
      default:
        return "No transactions found for the selected period.";
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="hidden md:flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <InlineFeatureGate feature={FeatureFlag.EXCEL_EXPORT}>
            <ExcelExport />
          </InlineFeatureGate>
          <InlineFeatureGate feature={FeatureFlag.EXCEL_IMPORT}>
            <ExcelImport onImportComplete={() => refetch()} />
          </InlineFeatureGate>
          <InlineFeatureGate feature={FeatureFlag.AI_RECEIPT_SCANNING}>
            <ReceiptParser
              onReceiptParsed={handleReceiptParsed}
              userCategories={categories}
            />
          </InlineFeatureGate>
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
      </div>

      {/* Timeframe Control */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-6 py-2">
        <TimeframeControls />
      </div>

      {/* Transactions List */}
      <div>
        {isLoading ? (
          <TransactionSkeletonList count={10} />
        ) : sortedGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {getEmptyStateMessage()}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedGroups.map(([groupKey, groupTransactions]) => (
              <TransactionGroup
                key={groupKey}
                groupKey={groupKey}
                groupTransactions={groupTransactions}
                timeframe={timeframe}
                categories={categories}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
