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
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Plus, Edit } from "lucide-react";
import { format } from "date-fns";
import { formatTransactionAmount } from "@/lib/utils";

export function TransactionsContent() {
  const { user } = useAuth();
  const { data: transactions = [], isLoading } = useTransactions(
    user?.id || ""
  );
  const { data: categories = [] } = useCategories(user?.id || "");

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#6b7280";
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-end mb-8">
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
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="relative">
                  {/* Mobile click-to-edit overlay */}
                  <TransactionForm
                    mode="edit"
                    transaction={transaction}
                    trigger={
                      <div className="block md:hidden absolute inset-0 z-10" />
                    }
                  />

                  {/* Transaction content */}
                  <div className="flex items-center justify-between p-4 border rounded-lg md:cursor-default cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCategoryColor(
                            transaction.categoryId
                          ),
                        }}
                      />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {getCategoryName(transaction.categoryId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatTransactionAmount(
                            transaction.amount,
                            transaction.type
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(transaction.date, "MMM dd, yyyy")}
                        </p>
                      </div>
                      {/* Edit button - hidden on mobile, visible on desktop */}
                      <TransactionForm
                        mode="edit"
                        transaction={transaction}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:flex"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
