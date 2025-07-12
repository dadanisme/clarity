import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/firebase/services";
import type { TransactionFormData } from "@/lib/validations";
import { useTimeframeStore } from "@/lib/stores/timeframe-store";

export function useTransactions(userId: string) {
  const { getDateRange, timeframe, currentPeriod } = useTimeframeStore();
  const { startDate, endDate } = getDateRange();
  
  return useQuery({
    queryKey: ["transactions", userId, timeframe, currentPeriod.getTime()],
    queryFn: () => getTransactions(userId, { startDate, endDate }),
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
      queryClient.invalidateQueries({ 
        queryKey: ["transactions", userId],
        type: "all"
      });
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
      queryClient.invalidateQueries({ 
        queryKey: ["transactions", userId],
        type: "all"
      });
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
      queryClient.invalidateQueries({ 
        queryKey: ["transactions", userId],
        type: "all"
      });
    },
  });
}
