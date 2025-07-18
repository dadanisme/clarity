import { formatCurrency } from "@/lib/utils";
import { ComparisonIndicator } from "./comparison-indicator";
import type { CategorySpending } from "./types";

interface TopCategoriesListProps {
  categories: CategorySpending[];
}

export function TopCategoriesList({ categories }: TopCategoriesListProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">
          Top 5 Categories
        </h4>
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.category_id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm">
                      {category.name}
                    </div>
                    <ComparisonIndicator category={category} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category.transactionCount} transaction
                    {category.transactionCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-destructive">
                  {formatCurrency(category.amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}