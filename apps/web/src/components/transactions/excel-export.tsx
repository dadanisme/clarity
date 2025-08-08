"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import {
  exportTransactionsToExcel,
  exportTransactionsToCSV,
} from "@clarity/shared/utils/excel-exporter";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExcelExportProps {
  trigger?: React.ReactNode;
}

type ExportFormat = "excel" | "csv";

export function ExcelExport({ trigger }: ExcelExportProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("excel");

  const { user } = useAuth();
  const { data: transactions = [] } = useTransactions(user?.id || "");
  const { data: categories = [] } = useCategories(user?.id || "");

  const handleExport = async () => {
    if (!transactions.length) {
      toast.error("No transactions to export");
      return;
    }

    setIsExporting(true);
    try {
      const filename = `transactions_${format(new Date(), "yyyy-MM-dd")}`;

      if (exportFormat === "excel") {
        exportTransactionsToExcel(transactions, categories, `${filename}.xlsx`);
        toast.success(
          `Successfully exported ${transactions.length} transactions to Excel`
        );
      } else {
        exportTransactionsToCSV(transactions, categories, `${filename}.csv`);
        toast.success(
          `Successfully exported ${transactions.length} transactions to CSV`
        );
      }

      setOpen(false);
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast.error("Failed to export transactions. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const getExportStats = () => {
    if (!transactions.length) return null;

    const income = transactions.filter((t) => t.type === "income").length;
    const expense = transactions.filter((t) => t.type === "expense").length;
    const dateRange =
      transactions.length > 0
        ? {
            earliest: new Date(
              Math.min(...transactions.map((t) => new Date(t.date).getTime()))
            ),
            latest: new Date(
              Math.max(...transactions.map((t) => new Date(t.date).getTime()))
            ),
          }
        : null;

    return { income, expense, dateRange };
  };

  const stats = getExportStats();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="relative">
            <Download className="w-4 h-4 mr-2" />
            Export
            <span className="absolute -top-2 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              New
            </span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogDescription>
            Export your transactions to Excel or CSV format for external use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Statistics */}
          {stats && (
            <div className="border rounded-lg bg-card p-4">
              <h4 className="font-medium mb-3">Export Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Transactions</p>
                  <p className="font-medium">{transactions.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Income/Expense</p>
                  <p className="font-medium">
                    {stats.income}/{stats.expense}
                  </p>
                </div>
                {stats.dateRange && (
                  <>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">
                        Transaction Date Range
                      </p>
                      <p className="font-medium">
                        {format(stats.dateRange.earliest, "dd/MM/yyyy")} -{" "}
                        {format(stats.dateRange.latest, "dd/MM/yyyy")}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <RadioGroup
              value={exportFormat}
              onValueChange={(value: string) =>
                setExportFormat(value as ExportFormat)
              }
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="excel" id="excel" />
                <Label
                  htmlFor="excel"
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                >
                  <FileSpreadsheet className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium">Excel (.xlsx)</p>
                    <p className="text-sm text-muted-foreground">
                      Best for data analysis and spreadsheet applications
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="csv" id="csv" />
                <Label
                  htmlFor="csv"
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">CSV (.csv)</p>
                    <p className="text-sm text-muted-foreground">
                      Universal format compatible with most applications
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Format Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Exported Columns</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your exported file will contain the following columns:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <strong>Period</strong>: Date (DD/MM/YYYY)
              </li>
              <li>
                • <strong>Category</strong>: Category name
              </li>
              <li>
                • <strong>Note</strong>: Transaction description
              </li>
              <li>
                • <strong>IDR</strong>: Transaction amount
              </li>
              <li>
                • <strong>Type</strong>: Income or Expense
              </li>
            </ul>
          </div>

          {/* Export Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || !transactions.length}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {transactions.length} Transaction
                  {transactions.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>

          {!transactions.length && (
            <div className="text-center py-4 text-muted-foreground">
              No transactions available to export. Add some transactions first.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
