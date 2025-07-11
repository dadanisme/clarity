import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/firebase/services";
import type { TransactionFormData } from "@/lib/validations";

export function useTransactions(userId: string) {
  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => getTransactions(userId),
    enabled: !!userId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: TransactionFormData;
    }) => createTransaction(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      transactionId,
      data,
    }: {
      userId: string;
      transactionId: string;
      data: Partial<TransactionFormData>;
    }) => updateTransaction(userId, transactionId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      transactionId,
    }: {
      userId: string;
      transactionId: string;
    }) => deleteTransaction(userId, transactionId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
    },
  });
}
