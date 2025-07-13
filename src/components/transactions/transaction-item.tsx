"use client";

import { Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Transaction, Category } from "@/types";
import type { ReactNode } from "react";

interface TransactionItemProps {
  transaction: Transaction;
  categories: Category[];
  showCategory?: boolean;
  showDate?: boolean;
  onClick?: () => void;
  className?: string;
  showEditButton?: boolean;
  editTrigger?: ReactNode;
  mobileEditOverlay?: ReactNode;
}

export function TransactionItem({
  transaction,
  categories,
  showCategory = true,
  showDate = true,
  onClick,
  className = "",
  showEditButton = false,
  editTrigger,
  mobileEditOverlay,
}: TransactionItemProps) {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#6b7280";
  };

  return (
    <div className="relative">
      {/* Mobile click-to-edit overlay */}
      {mobileEditOverlay}

      <div
        className={`flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/20 shadow-sm ${
          onClick ? "cursor-pointer" : ""
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">
              {transaction.description ||
                getCategoryName(transaction.categoryId)}
            </p>
            {(showDate || showCategory) && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {showDate && (
                  <>
                    <Calendar className="w-3 h-3" />
                    <span>{format(transaction.date, "MMM d, yyyy")}</span>
                  </>
                )}
                {showCategory && (
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: getCategoryColor(
                          transaction.categoryId
                        ),
                      }}
                    />
                    <span>{getCategoryName(transaction.categoryId)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right ml-2">
            <p
              className={`text-sm font-semibold ${
                transaction.type === "income"
                  ? "text-green-600"
                  : "text-primary"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          {showEditButton && (
            <div className="flex space-x-1">
              {editTrigger || (
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
