"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTimeframeStore,
  type TimeframeType,
} from "@/lib/stores/timeframe-store";

export function TimeframeControls() {
  const {
    timeframe,
    currentPeriod,
    setTimeframe,
    setCurrentPeriod,
    goToPrevious,
    goToNext,
  } = useTimeframeStore();
  const getSelectOptions = () => {
    const currentYear = new Date().getFullYear();

    switch (timeframe) {
      case "daily":
        // Only show this year
        return Array.from({ length: 12 }, (_, monthIndex) => ({
          value: `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`,
          label: format(new Date(currentYear, monthIndex), "MMMM yyyy"),
        }));
      case "weekly":
        // Show this year and previous 2 years
        return [currentYear, currentYear - 1, currentYear - 2].flatMap((year) =>
          Array.from({ length: 4 }, (_, quarter) => ({
            value: `${year}-Q${quarter + 1}`,
            label: `Q${quarter + 1} ${year}`,
          }))
        );
      case "monthly":
        // Show last 5 years
        return Array.from({ length: 5 }, (_, i) => {
          const year = currentYear - 4 + i;
          return {
            value: year.toString(),
            label: year.toString(),
          };
        });
      default:
        return [];
    }
  };

  const getCurrentValue = () => {
    switch (timeframe) {
      case "daily":
        return `${currentPeriod.getFullYear()}-${String(
          currentPeriod.getMonth() + 1
        ).padStart(2, "0")}`;
      case "weekly":
        const quarter = Math.floor(currentPeriod.getMonth() / 3) + 1;
        return `${currentPeriod.getFullYear()}-Q${quarter}`;
      case "monthly":
        return currentPeriod.getFullYear().toString();
      default:
        return "";
    }
  };

  const isPreviousDisabled = () => {
    const currentYear = new Date().getFullYear();

    switch (timeframe) {
      case "daily":
        // Disable if current period is January of current year
        return (
          currentPeriod.getFullYear() === currentYear &&
          currentPeriod.getMonth() === 0
        );
      case "weekly":
        // Disable if current period is Q1 of 2 years ago
        const quarter = Math.floor(currentPeriod.getMonth() / 3) + 1;
        return currentPeriod.getFullYear() === currentYear - 2 && quarter === 1;
      case "monthly":
        // Disable if current period is 5 years ago
        return currentPeriod.getFullYear() === currentYear - 4;
      default:
        return false;
    }
  };

  const isNextDisabled = () => {
    const currentYear = new Date().getFullYear();

    switch (timeframe) {
      case "daily":
        // Disable if current period is December of current year
        return (
          currentPeriod.getFullYear() === currentYear &&
          currentPeriod.getMonth() === 11
        );
      case "weekly":
        // Disable if current period is Q4 of current year
        const quarter = Math.floor(currentPeriod.getMonth() / 3) + 1;
        return currentPeriod.getFullYear() === currentYear && quarter === 4;
      case "monthly":
        // Disable if current period is current year
        return currentPeriod.getFullYear() === currentYear;
      default:
        return false;
    }
  };

  const handleTimeframeChange = (value: string) => {
    const newTimeframe = value as TimeframeType;
    setTimeframe(newTimeframe);
  };

  const handleSelectChange = (value: string) => {
    let newDate: Date;

    switch (timeframe) {
      case "daily":
        const [year, monthStr] = value.split("-");
        const monthIndex = parseInt(monthStr) - 1;
        newDate = new Date(parseInt(year), monthIndex, 1);
        break;
      case "weekly":
        const [yearStr, quarterStr] = value.split("-");
        const quarter = parseInt(quarterStr.replace("Q", ""));
        const quarterMonth = (quarter - 1) * 3;
        newDate = new Date(parseInt(yearStr), quarterMonth, 1);
        break;
      case "monthly":
        newDate = new Date(parseInt(value), 0, 1);
        break;
      default:
        newDate = new Date();
    }

    setCurrentPeriod(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Timeframe Indicator */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={isPreviousDisabled()}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Select value={getCurrentValue()} onValueChange={handleSelectChange}>
          <SelectTrigger className="font-semibold text-lg border-none bg-transparent dark:bg-transparent shadow-none hover:bg-transparent dark:hover:bg-transparent focus:ring-0 focus:ring-offset-0 p-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getSelectOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={isNextDisabled()}
          className="flex items-center space-x-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Group by Control */}
      <div className="space-y-2">
        <SegmentedControl
          value={timeframe}
          onValueChange={handleTimeframeChange}
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ]}
        />
      </div>
    </div>
  );
}
