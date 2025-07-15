"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { CategoryForm } from "./category-form";
import { Edit } from "lucide-react";
import { CategorySkeletonList } from "./category-skeleton-list";

export function CategoryList() {
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );

  const { user } = useAuth();
  const { data: categories = [], isLoading } = useCategories(user?.id || "");

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const matchesType = typeFilter === "all" || category.type === typeFilter;
    return matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Type Filter */}
      <div className="space-y-2">
        <SegmentedControl
          value={typeFilter}
          onValueChange={(value) =>
            setTypeFilter(value as "all" | "income" | "expense")
          }
          options={[
            { value: "all", label: "All" },
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" },
          ]}
        />
      </div>

      {/* Categories List */}
      <div>
        {isLoading ? (
          <CategorySkeletonList count={6} />
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {typeFilter !== "all"
              ? "No categories match your filters."
              : "No categories yet. Add your first category to get started!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCategories.map((category) => (
              <div key={category.id} className="relative">
                {/* Mobile click-to-edit overlay */}
                <CategoryForm
                  category={category}
                  mode="edit"
                  trigger={
                    <div className="block md:hidden absolute inset-0 z-10" />
                  }
                />
                {/* Category content */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {category.type}
                        {category.isDefault && " • Default"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {/* Desktop edit button */}
                      <CategoryForm
                        category={category}
                        mode="edit"
                        trigger={
                          <Button variant="ghost" className="hidden md:flex">
                            <Edit className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
