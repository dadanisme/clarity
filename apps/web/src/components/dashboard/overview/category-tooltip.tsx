import { formatCurrency } from "@/lib/utils";
import { ComparisonIndicator } from "./comparison-indicator";
import type { CategorySpending } from "./types";

interface CategoryTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CategorySpending }>;
}

export function CategoryTooltip({ active, payload }: CategoryTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <div className="font-medium">{data.name}</div>
        <div className="text-sm text-destructive font-bold">
          {formatCurrency(data.amount)}
        </div>
        <div className="text-xs text-muted-foreground">
          {data.percentage.toFixed(1)}% of total
        </div>
        {data.hasData && (
          <div className="text-xs mt-1">
            <ComparisonIndicator category={data} />
          </div>
        )}
      </div>
    );
  }
  return null;
}
