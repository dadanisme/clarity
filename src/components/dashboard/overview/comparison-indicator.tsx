import { TrendingDown, TrendingUp } from "lucide-react";
import type { CategorySpending } from "./types";

interface ComparisonIndicatorProps {
  category: CategorySpending;
}

export function ComparisonIndicator({ category }: ComparisonIndicatorProps) {
  if (!category.hasData) return null;

  const isPositive = category.percentageChange > 0;
  const isNegative = category.percentageChange < 0;
  
  // For expenses, decrease is good (green), increase is bad (red)
  const isGood = isNegative;

  return (
    <div
      className={`text-xs flex items-center gap-1 ${
        isGood
          ? "text-primary"
          : !isGood && (isPositive || isNegative)
          ? "text-destructive"
          : "text-muted-foreground"
      }`}
    >
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {Math.abs(category.percentageChange).toFixed(1)}%
    </div>
  );
}