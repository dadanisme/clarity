import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsService } from "@/lib/supabase";
import type { TransactionFormData } from "@/lib/validations";
import { useTimeframeStore } from "@/lib/stores/timeframe-store";

export function useTransactions(userId: string) {
  const { getDateRange, timeframe, currentPeriod } = useTimeframeStore();
  const { startDate, endDate } = getDateRange();
  
  return useQuery({
    queryKey: ["transactions", userId, timeframe, currentPeriod.getTime()],
    queryFn: () => TransactionsService.getTransactions(userId, { startDate, endDate }),
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
    }) => TransactionsService.createTransaction(userId, data),
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
    }) => TransactionsService.updateTransaction(transactionId, data),
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
    }) => TransactionsService.deleteTransaction(transactionId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ 
        queryKey: ["transactions", userId],
        type: "all"
      });
    },
  });
}