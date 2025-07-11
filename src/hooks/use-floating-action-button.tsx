"use client";

import { usePathname } from "next/navigation";
import { Plus, Tag, Camera } from "lucide-react";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { CategoryForm } from "@/components/categories/category-form";
import { ReceiptParser } from "@/components/transactions/receipt-parser";
import { useAuth } from "@/lib/providers/auth-provider";
import { useCategories } from "@/hooks/use-categories";
import { PATHS } from "@/lib/paths";

export function useFloatingActionButton() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories(user?.id || "");

  // Only show on specific pages
  const show =
    pathname === PATHS.transactions ||
    pathname === PATHS.overview ||
    pathname === PATHS.categories;

  if (!show) {
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

  // For transactions page, show both transaction form and receipt parser
  if (pathname === "/transactions") {
    return {
      show: true,
      children: (
        <div className="flex flex-col space-y-3">
          <ReceiptParser
            onReceiptParsed={() => {
              // The receipt parser will handle the data internally
              // User can manually create transactions from the parsed data
            }}
            userCategories={categories}
            userId={user?.id}
            trigger={
              <div className="w-14 h-14 rounded-full shadow-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center relative">
                <Camera className="w-6 h-6 text-secondary-foreground" />
                <span className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-xs px-1.5 py-0.5 rounded-full">
                  New
                </span>
              </div>
            }
          />
          <TransactionForm
            mode="create"
            trigger={
              <div className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
            }
          />
        </div>
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
