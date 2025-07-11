"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/providers/auth-provider";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { CategoryForm } from "./category-form";
import { Edit, Trash2 } from "lucide-react";

export function CategoryList() {
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );

  const { user } = useAuth();
  const { data: categories = [], isLoading } = useCategories(user?.id || "");
  const deleteCategory = useDeleteCategory();

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const matchesType = typeFilter === "all" || category.type === typeFilter;
    return matchesType;
  });

  const handleDelete = async (categoryId: string) => {
    if (user?.id) {
      try {
        await deleteCategory.mutateAsync({
          userId: user.id,
          categoryId,
        });
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

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
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {typeFilter !== "all"
              ? "No categories match your filters."
              : "No categories yet. Add your first category to get started!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
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
                <div className="flex space-x-1">
                  <CategoryForm
                    category={category}
                    mode="edit"
                    trigger={
                      <Button variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    }
                  />
                  {!category.isDefault && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;
                            {category.name}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
