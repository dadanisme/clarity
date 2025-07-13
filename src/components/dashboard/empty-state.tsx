"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Tag } from "lucide-react";

interface EmptyStateProps {
  isLoading: boolean;
  hasTransactions: boolean;
}

export function EmptyState({ isLoading, hasTransactions }: EmptyStateProps) {
  const router = useRouter();

  if (hasTransactions) return null;

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted" />
              <div className="h-4 bg-muted rounded w-48 mx-auto" />
              <div className="h-3 bg-muted rounded w-64 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl bg-muted/30">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-background flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary">
              Start Your Financial Journey
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Begin tracking your finances by adding your first transaction.
              Every great financial story starts with a single entry.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push("/transactions")}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/transactions")}
                className="rounded-xl"
              >
                <Tag className="w-4 h-4 mr-2" />
                Scan Receipt
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
