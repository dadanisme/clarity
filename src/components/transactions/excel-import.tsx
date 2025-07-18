"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, FileSpreadsheet, Upload, X, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { TransactionsService } from "@/lib/supabase/transactions-service";
import { CategoriesService } from "@/lib/supabase/categories-service";
import { parseExcelFile } from "@/lib/utils/excel-parser";
import { TransactionPreviewTable } from "./transaction-preview-table";
import { toast } from "sonner";
import type { Category } from "@/types";

interface ExcelImportProps {
  onImportComplete: () => void;
  trigger?: React.ReactNode;
}

interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
  categoryName: string;
  type: "income" | "expense";
}

export function ExcelImport({ onImportComplete, trigger }: ExcelImportProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedTransaction[] | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "importing">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { data: categories = [] } = useCategories(user?.id || "");
  const queryClient = useQueryClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast.error("Please select a valid Excel file (.xlsx, .xls, or .csv)");
        return;
      }
      setFile(selectedFile);
      setParsedData(null);
    }
  };

  const handleFileClear = () => {
    setFile(null);
    setParsedData(null);
    setStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleParseFile = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const transactions = await parseExcelFile(file);
      setParsedData(transactions);
      setStep("preview");
      toast.success(`Successfully parsed ${transactions.length} transactions`);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file. Please check the format.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportTransactions = async () => {
    if (!parsedData || !user?.id) return;

    setStep("importing");
    setIsLoading(true);
    try {
      // Create missing categories first
      const existingCategoryNames = new Set(categories.map(c => c.name.toLowerCase()));
      const newCategoryNames = new Set<string>();
      
      parsedData.forEach(transaction => {
        const categoryName = transaction.categoryName.toLowerCase();
        if (!existingCategoryNames.has(categoryName) && !newCategoryNames.has(categoryName)) {
          newCategoryNames.add(categoryName);
        }
      });

      // Create new categories
      const createdCategories: Category[] = [];
      for (const categoryName of newCategoryNames) {
        // Determine category type based on transaction type
        const sampleTransaction = parsedData.find(t => 
          t.categoryName.toLowerCase() === categoryName
        );
        const categoryType = sampleTransaction?.type || "expense";
        
        // Generate a color for the new category
        const colors = [
          "#ef4444", "#f97316", "#eab308", "#22c55e", 
          "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const newCategory = await CategoriesService.createCategory(user.id, {
          name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
          type: categoryType,
          color,
          is_default: false,
        });
        
        createdCategories.push(newCategory);
      }

      // Create category lookup map
      const allCategories = [...categories, ...createdCategories];
      const categoryMap = new Map<string, string>();
      allCategories.forEach(category => {
        categoryMap.set(category.name.toLowerCase(), category.id);
      });

      // Convert parsed data to transactions
      const transactions = parsedData.map(transaction => ({
        amount: transaction.amount,
        type: transaction.type,
        category_id: categoryMap.get(transaction.categoryName.toLowerCase()) || "",
        description: transaction.description,
        date: transaction.date.toISOString(),
      }));

      // Import transactions
      await TransactionsService.createMultipleTransactions(user.id, transactions);

      // Invalidate queries to refresh UI
      await queryClient.invalidateQueries({ 
        queryKey: ["transactions", user.id],
        type: "all"
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["categories", user.id],
        type: "all"
      });

      toast.success(
        `Successfully imported ${transactions.length} transactions${
          createdCategories.length > 0 
            ? ` and created ${createdCategories.length} new categories`
            : ""
        }`
      );

      // Clean up and close
      setOpen(false);
      handleReset();
      onImportComplete();
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error("Failed to import transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBackToUpload = () => {
    setStep("upload");
    setParsedData(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleReset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="relative">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Import Excel
            <span className="absolute -top-2 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              New
            </span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import from Excel"}
            {step === "preview" && "Preview Transactions"}
            {step === "importing" && "Importing Transactions"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload an Excel file to import transactions. Missing categories will be created automatically."}
            {step === "preview" && "Review the parsed transactions before importing them."}
            {step === "importing" && "Please wait while we import your transactions..."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "upload" && (
            <>
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="excel-file">Select Excel File</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50">
                  {file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileSpreadsheet className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFileClear}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <Button
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Supports .xlsx, .xls, and .csv files
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,.xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Expected Format Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Expected Format</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Your Excel file should contain the following columns:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Period</strong>: Date (DD/MM/YYYY)</li>
                  <li>• <strong>Category</strong>: Category name</li>
                  <li>• <strong>Note</strong>: Transaction description</li>
                  <li>• <strong>IDR</strong>: Transaction amount</li>
                  <li>• <strong>Type</strong>: Income or Expense</li>
                </ul>
              </div>

              {/* Parse Button */}
              {file && (
                <Button
                  onClick={handleParseFile}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing File...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Parse & Preview
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {step === "preview" && parsedData && (
            <>
              {/* Summary */}
              <div className="border rounded-lg bg-card p-4">
                <h4 className="font-medium mb-2">Import Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Transactions</p>
                    <p className="font-medium">{parsedData.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date Range</p>
                    <p className="font-medium">
                      {parsedData.length > 0 && (
                        `${new Date(Math.min(...parsedData.map(t => t.date.getTime()))).toLocaleDateString()} - ${new Date(Math.max(...parsedData.map(t => t.date.getTime()))).toLocaleDateString()}`
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Categories that will be created */}
                {(() => {
                  const existingCategoryNames = new Set(categories.map(c => c.name.toLowerCase()));
                  const newCategories = [...new Set(parsedData.map(t => t.categoryName))]
                    .filter(name => !existingCategoryNames.has(name.toLowerCase()));
                  
                  if (newCategories.length > 0) {
                    return (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">
                          New categories to be created:
                        </p>
                        <p className="text-sm font-medium">
                          {newCategories.join(", ")}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Transaction Preview */}
              <TransactionPreviewTable transactions={parsedData} maxRows={15} />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBackToUpload}
                  className="flex-1"
                >
                  Back to Upload
                </Button>
                <Button
                  onClick={handleImportTransactions}
                  disabled={isLoading || parsedData.length === 0}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Import {parsedData.length} Transaction{parsedData.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </>
          )}

          {step === "importing" && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
              <p className="text-lg font-medium mb-2">Importing Transactions</p>
              <p className="text-muted-foreground">
                Please wait while we create your transactions and categories...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}