import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHotkeys } from "react-hotkeys-hook";
import { addDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/use-transactions";
import { transactionSchema } from "@clarity/shared/validations";
import type { Transaction } from "@clarity/types";
import type { TransactionFormData } from "@clarity/shared/validations";

interface UseTransactionFormProps {
  transaction?: Transaction;
  mode: "create" | "edit";
  defaultDate?: Date;
  enableHotkey?: boolean;
  lastTransactionDate?: Date;
}

/**
 * ViewModel hook for transaction form
 * Handles form state, mutations, and business logic
 */
export function useTransactionForm({
  transaction,
  mode,
  defaultDate,
  enableHotkey = false,
  lastTransactionDate,
}: UseTransactionFormProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: categories = [] } = useCategories(user?.id || "");
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          amount: transaction.amount,
          type: transaction.type as "income" | "expense",
          category_id: transaction.category_id,
          description: transaction.description || "",
          date: new Date(transaction.date),
        }
      : {
          amount: 0,
          type: "expense",
          category_id: "",
          description: "",
          date: defaultDate || new Date(),
        },
  });

  const watchedType = form.watch("type");
  const filteredCategories = categories.filter(
    (cat) => cat.type === watchedType
  );

  const createFromDate = useCallback(
    (date: Date) => {
      setOpen(true);
      form.reset({
        amount: 0,
        type: "expense",
        category_id: "",
        description: "",
        date,
      });
    },
    [form]
  );

  // ENTER = create transaction (today)
  useHotkeys(
    "enter",
    (e) => {
      e.preventDefault();
      createFromDate(defaultDate || new Date());
    },
    { enabled: enableHotkey && !open }
  );

  // SPACE = create transaction for last date
  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();
      createFromDate(lastTransactionDate || defaultDate || new Date());
    },
    { enabled: enableHotkey && !open }
  );

  // CTRL = create transaction for last date + 1
  useHotkeys(
    "ctrl",
    (e) => {
      e.preventDefault();
      const dateToUse = lastTransactionDate || new Date();
      const nextDay = addDays(dateToUse, 1);
      createFromDate(nextDay);
    },
    { enabled: enableHotkey && !open }
  );

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (mode === "create" && user?.id) {
        await createTransaction.mutateAsync({
          userId: user.id,
          data,
        });
      } else if (mode === "edit" && user?.id && transaction) {
        await updateTransaction.mutateAsync({
          transactionId: transaction.id,
          data,
        });
      }

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Transaction save failed:", error);
    }
  };

  const handleDelete = async () => {
    if (user?.id && transaction) {
      try {
        await deleteTransaction.mutateAsync({
          transactionId: transaction.id,
        });
        setOpen(false);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return {
    open,
    setOpen,
    form,
    watchedType,
    filteredCategories,
    onSubmit,
    handleDelete,
    transaction,
  };
}
