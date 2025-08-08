import { useAuth } from "@/hooks/use-auth";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { createTransactionsFromReceipt } from "@clarity/shared/utils/category-mapper";
import type { Category } from "@clarity/types";

export function useReceiptHandler() {
  const { user } = useAuth();
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
    timestamp: string | null,
    categories: Category[]
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

  return {
    handleReceiptParsed,
    isCreating: createTransaction.isPending,
  };
}
