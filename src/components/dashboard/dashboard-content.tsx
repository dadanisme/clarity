"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/providers/auth-provider";
import { useTransactions } from "@/hooks/use-transactions";
import { Plus, TrendingUp, TrendingDown, DollarSign, Tag } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions(user?.id || "");

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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Development Banner */}
      <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
          <span className="text-sm font-medium text-warning-foreground">
            Dashboard in Development
          </span>
        </div>
        <p className="text-xs text-warning-foreground/80 mt-1">
          More features and insights coming soon!
        </p>
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
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(income)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(expenses)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {transactionsLoading ? (
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted" />
            <div className="h-4 bg-muted rounded w-48 mx-auto mb-2" />
            <div className="h-3 bg-muted rounded w-64 mx-auto" />
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your finances by adding your first transaction or
              scanning a receipt.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => router.push("/transactions")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/transactions")}
              >
                <Tag className="w-4 h-4 mr-2" />
                Scan Receipt
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
