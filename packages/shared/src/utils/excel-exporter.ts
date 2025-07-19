import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { Transaction, Category } from "@clarity/types";

interface ExportTransaction {
  Period: string;
  Category: string;
  Note: string;
  IDR: number;
  Type: string;
}

export function exportTransactionsToExcel(
  transactions: Transaction[],
  categories: Category[],
  filename?: string
): void {
  // Create category lookup map
  const categoryMap = new Map<string, Category>();
  categories.forEach(category => {
    categoryMap.set(category.id, category);
  });

  // Transform transactions to export format
  const exportData: ExportTransaction[] = transactions.map(transaction => {
    const category = categoryMap.get(transaction.category_id);
    
    return {
      Period: format(new Date(transaction.date), "dd/MM/yyyy"),
      Category: category?.name || "Unknown",
      Note: transaction.description || "Transaction",
      IDR: transaction.amount,
      Type: transaction.type === "income" ? "Income" : "Expense",
    };
  });

  // Sort by date (newest first)
  exportData.sort((a, b) => {
    const dateA = new Date(a.Period.split("/").reverse().join("-")).getTime();
    const dateB = new Date(b.Period.split("/").reverse().join("-")).getTime();
    return dateB - dateA;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 12 }, // Period
    { wch: 20 }, // Category
    { wch: 40 }, // Note
    { wch: 15 }, // IDR
    { wch: 10 }, // Type
  ];
  worksheet["!cols"] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  // Generate filename with current date if not provided
  const defaultFilename = `transactions_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  const exportFilename = filename || defaultFilename;

  // Write and download the file
  XLSX.writeFile(workbook, exportFilename);
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  filename?: string
): void {
  // Create category lookup map
  const categoryMap = new Map<string, Category>();
  categories.forEach(category => {
    categoryMap.set(category.id, category);
  });

  // Transform transactions to export format
  const exportData: ExportTransaction[] = transactions.map(transaction => {
    const category = categoryMap.get(transaction.category_id);
    
    return {
      Period: format(new Date(transaction.date), "dd/MM/yyyy"),
      Category: category?.name || "Unknown",
      Note: transaction.description || "Transaction",
      IDR: transaction.amount,
      Type: transaction.type === "income" ? "Income" : "Expense",
    };
  });

  // Sort by date (newest first)
  exportData.sort((a, b) => {
    const dateA = new Date(a.Period.split("/").reverse().join("-")).getTime();
    const dateB = new Date(b.Period.split("/").reverse().join("-")).getTime();
    return dateB - dateA;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  // Generate filename with current date if not provided
  const defaultFilename = `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
  const exportFilename = filename || defaultFilename;

  // Write and download the file as CSV
  XLSX.writeFile(workbook, exportFilename, { bookType: "csv" });
}