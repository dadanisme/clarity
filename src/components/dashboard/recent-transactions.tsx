"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TransactionItem } from "@/components/transactions/transaction-item";
import type { Transaction, Category } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function RecentTransactions({
  transactions,
  categories,
}: RecentTransactionsProps) {
  const router = useRouter();

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentTransactions.length === 0) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-primary">
            Recent Transactions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your latest financial activity
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/transactions")}
          className="text-muted-foreground hover:text-primary"
        >
          View all
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {recentTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              showCategory={true}
              showDate={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
