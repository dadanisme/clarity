"use client";

import { useRouter } from "next/navigation";
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
import { Plus, TrendingUp, TrendingDown, DollarSign, Tag } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, formatTransactionAmount } from "@/lib/utils";

export function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
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

  const recentTransactions = transactions.slice(0, 5);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s your financial overview.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => router.push("/categories")}>
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button onClick={() => router.push("/transactions")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(income)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(expenses)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/transactions")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading transactions...
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Add your first transaction to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
