"use client";

import { usePathname } from "next/navigation";
import { Plus, Tag } from "lucide-react";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { CategoryForm } from "@/components/categories/category-form";

export function useFloatingActionButton() {
  const pathname = usePathname();

  // Only show on specific pages
  const shouldShow =
    pathname === "/dashboard" ||
    pathname === "/transactions" ||
    pathname === "/categories";

  if (!shouldShow) {
    return { show: false };
  }

  const isCategoriesPage = pathname === "/categories";

  if (isCategoriesPage) {
    return {
      show: true,
      children: (
        <CategoryForm
          mode="create"
          trigger={
            <div className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center">
              <Tag className="w-6 h-6 text-primary-foreground" />
            </div>
          }
        />
      ),
    };
  }

  return {
    show: true,
    children: (
      <TransactionForm
        mode="create"
        trigger={
          <div className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
        }
      />
    ),
  };
}
