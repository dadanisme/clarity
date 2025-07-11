"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/providers/auth-provider";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { createMultipleTransactions } from "@/lib/firebase/services";
import { generateDummyTransactionsForCurrentYear } from "@/lib/utils/dummy-data";
import { Database, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DummyDataButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { data: categories = [] } = useCategories(user?.id || "");
  const { refetch } = useTransactions(user?.id || "");

  const handleGenerateDummyData = async () => {
    if (!user?.id || categories.length === 0) {
      toast.error("Please create some categories first");
      return;
    }

    setIsGenerating(true);
    try {
      // Generate dummy transactions for the current year
      const dummyTransactions =
        generateDummyTransactionsForCurrentYear(categories);

      // Create all transactions in Firebase
      await createMultipleTransactions(user.id, dummyTransactions);

      // Refetch transactions to update the UI
      await refetch();

      toast.success(
        `Generated ${
          dummyTransactions.length
        } transactions for ${new Date().getFullYear()}`
      );
    } catch (error) {
      console.error("Error generating dummy data:", error);
      toast.error("Failed to generate dummy data. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGenerateDummyData}
      disabled={isGenerating || categories.length === 0}
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Database className="w-4 h-4" />
      )}
      {isGenerating ? "Generating..." : "Generate Sample Data"}
    </Button>
  );
}
