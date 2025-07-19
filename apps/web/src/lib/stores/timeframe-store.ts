import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";

export type TimeframeType = "daily" | "weekly" | "monthly";

interface TimeframeState {
  timeframe: TimeframeType;
  currentPeriod: Date;
  setTimeframe: (timeframe: TimeframeType) => void;
  setCurrentPeriod: (date: Date) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
  resetToCurrentPeriod: (newTimeframe: TimeframeType) => void;
  getDateRange: () => { startDate: Date; endDate: Date };
}

export const useTimeframeStore = create<TimeframeState>()(
  persist(
    (set, get) => ({
      timeframe: "daily",
      currentPeriod: new Date(),
      
      setTimeframe: (timeframe: TimeframeType) => {
        set({ timeframe });
        get().resetToCurrentPeriod(timeframe);
      },
      
      setCurrentPeriod: (date: Date) => {
        set({ currentPeriod: date });
      },
      
      goToPrevious: () => {
        const { timeframe, currentPeriod } = get();
        const newDate = new Date(currentPeriod);
        
        switch (timeframe) {
          case "daily":
            newDate.setMonth(newDate.getMonth() - 1);
            break;
          case "weekly":
            newDate.setMonth(newDate.getMonth() - 3); // Previous quarter
            break;
          case "monthly":
            newDate.setFullYear(newDate.getFullYear() - 1);
            break;
        }
        
        set({ currentPeriod: newDate });
      },
      
      goToNext: () => {
        const { timeframe, currentPeriod } = get();
        const newDate = new Date(currentPeriod);
        
        switch (timeframe) {
          case "daily":
            newDate.setMonth(newDate.getMonth() + 1);
            break;
          case "weekly":
            newDate.setMonth(newDate.getMonth() + 3); // Next quarter
            break;
          case "monthly":
            newDate.setFullYear(newDate.getFullYear() + 1);
            break;
        }
        
        set({ currentPeriod: newDate });
      },
      
      goToToday: () => {
        set({ currentPeriod: new Date() });
      },
      
      resetToCurrentPeriod: (newTimeframe: TimeframeType) => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        let newDate: Date;

        switch (newTimeframe) {
          case "daily":
            // Reset to current month of current year
            newDate = new Date(currentYear, currentMonth, 1);
            break;
          case "weekly":
            // Reset to current quarter of current year
            const currentQuarter = Math.floor(currentMonth / 3);
            const quarterMonth = currentQuarter * 3;
            newDate = new Date(currentYear, quarterMonth, 1);
            break;
          case "monthly":
            // Reset to current year
            newDate = new Date(currentYear, 0, 1);
            break;
          default:
            newDate = new Date();
        }

        set({ currentPeriod: newDate });
      },
      
      getDateRange: () => {
        const { timeframe, currentPeriod } = get();
        
        switch (timeframe) {
          case "daily":
            // For daily view, show data for the selected month
            return {
              startDate: startOfMonth(currentPeriod),
              endDate: endOfMonth(currentPeriod),
            };
          case "weekly":
            // For weekly view, show data for the selected quarter
            return {
              startDate: startOfQuarter(currentPeriod),
              endDate: endOfQuarter(currentPeriod),
            };
          case "monthly":
            // For monthly view, show data for the selected year
            return {
              startDate: startOfYear(currentPeriod),
              endDate: endOfYear(currentPeriod),
            };
          default:
            return {
              startDate: new Date(),
              endDate: new Date(),
            };
        }
      },
    }),
    {
      name: "timeframe-store",
      partialize: (state) => ({
        timeframe: state.timeframe,
        // Don't persist currentPeriod to always start with current date
      }),
    }
  )
);