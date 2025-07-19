import { useQuery } from "@tanstack/react-query";
import { TransactionsService } from "@/lib/supabase/transactions-service";
import { useTimeframeStore } from "@/lib/stores/timeframe-store";
import { subMonths, subQuarters, subYears } from "date-fns";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear 
} from "date-fns";

export function useOverviewData(userId: string) {
  const { timeframe, currentPeriod } = useTimeframeStore();
  
  // Get current period date range
  const getCurrentPeriodRange = () => {
    switch (timeframe) {
      case "daily":
        return {
          startDate: startOfMonth(currentPeriod),
          endDate: endOfMonth(currentPeriod),
        };
      case "weekly":
        return {
          startDate: startOfQuarter(currentPeriod),
          endDate: endOfQuarter(currentPeriod),
        };
      case "monthly":
        return {
          startDate: startOfYear(currentPeriod),
          endDate: endOfYear(currentPeriod),
        };
    }
  };

  // Get previous period date range
  const getPreviousPeriodRange = () => {
    let previousPeriodDate: Date;
    
    switch (timeframe) {
      case "daily":
        previousPeriodDate = subMonths(currentPeriod, 1);
        return {
          startDate: startOfMonth(previousPeriodDate),
          endDate: endOfMonth(previousPeriodDate),
        };
      case "weekly":
        previousPeriodDate = subQuarters(currentPeriod, 1);
        return {
          startDate: startOfQuarter(previousPeriodDate),
          endDate: endOfQuarter(previousPeriodDate),
        };
      case "monthly":
        previousPeriodDate = subYears(currentPeriod, 1);
        return {
          startDate: startOfYear(previousPeriodDate),
          endDate: endOfYear(previousPeriodDate),
        };
    }
  };

  const currentRange = getCurrentPeriodRange();
  const previousRange = getPreviousPeriodRange();

  // Fetch current period data
  const currentPeriodQuery = useQuery({
    queryKey: ["overview-current", userId, timeframe, currentPeriod.getTime()],
    queryFn: () => TransactionsService.getTransactions(userId, currentRange),
    enabled: !!userId,
  });

  // Fetch previous period data
  const previousPeriodQuery = useQuery({
    queryKey: ["overview-previous", userId, timeframe, currentPeriod.getTime()],
    queryFn: () => TransactionsService.getTransactions(userId, previousRange),
    enabled: !!userId,
  });

  return {
    currentPeriodTransactions: currentPeriodQuery.data || [],
    previousPeriodTransactions: previousPeriodQuery.data || [],
    isLoading: currentPeriodQuery.isLoading || previousPeriodQuery.isLoading,
    isError: currentPeriodQuery.isError || previousPeriodQuery.isError,
  };
}