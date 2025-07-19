"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Tag, Camera, FileSpreadsheet, Download, MoreVertical, X } from "lucide-react";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { CategoryForm } from "@/components/categories/category-form";
import { ReceiptParser } from "@/components/transactions/receipt-parser";
import { ExcelImport } from "@/components/transactions/excel-import";
import { ExcelExport } from "@/components/transactions/excel-export";
import { InlineFeatureGate } from "@/components/features/feature-gate";
import { FeatureFlag } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { PATHS } from "@/lib/paths";

export function useFloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories(user?.id || "");
  const { refetch: refetchTransactions } = useTransactions(user?.id || "");

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

  // For transactions page, show collapsible floating action buttons
  if (pathname === "/transactions") {
    return {
      show: true,
      children: (
        <div className="flex flex-col space-y-3">
          {/* Collapsible actions */}
          {isExpanded && (
            <>
              <InlineFeatureGate feature={FeatureFlag.EXCEL_EXPORT}>
                <ExcelExport
                  trigger={
                    <div className="w-12 h-12 rounded-full shadow-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center relative transition-all duration-200 animate-in slide-in-from-bottom-2">
                      <Download className="w-5 h-5 text-secondary-foreground" />
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full">
                        New
                      </span>
                    </div>
                  }
                />
              </InlineFeatureGate>
              <InlineFeatureGate feature={FeatureFlag.EXCEL_IMPORT}>
                <ExcelImport
                  onImportComplete={() => refetchTransactions()}
                  trigger={
                    <div className="w-12 h-12 rounded-full shadow-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all duration-200 animate-in slide-in-from-bottom-2">
                      <FileSpreadsheet className="w-5 h-5 text-secondary-foreground" />
                    </div>
                  }
                />
              </InlineFeatureGate>
              <InlineFeatureGate feature={FeatureFlag.AI_RECEIPT_SCANNING}>
                <ReceiptParser
                  onReceiptParsed={() => {
                    // The receipt parser will handle the data internally
                    // User can manually create transactions from the parsed data
                  }}
                  userCategories={categories}
                  trigger={
                    <div className="w-12 h-12 rounded-full shadow-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all duration-200 animate-in slide-in-from-bottom-2">
                      <Camera className="w-5 h-5 text-secondary-foreground" />
                    </div>
                  }
                />
              </InlineFeatureGate>
            </>
          )}
          
          {/* Toggle button */}
          <div 
            className="w-14 h-14 rounded-full shadow-lg bg-muted hover:bg-muted/80 flex items-center justify-center cursor-pointer transition-all duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <X className="w-6 h-6 text-muted-foreground" />
            ) : (
              <MoreVertical className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Primary action - always visible */}
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
