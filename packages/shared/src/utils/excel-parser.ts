import * as XLSX from "xlsx";

interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
  categoryName: string;
  type: "income" | "expense";
}


// Possible column names for each field (case-insensitive)
const COLUMN_MAPPINGS = {
  date: ["period", "date", "tanggal", "waktu"],
  category: ["category", "kategori", "subcategory"],
  description: ["note", "description", "deskripsi", "catatan", "keterangan"],
  amount: ["amount", "idr", "jumlah", "nominal"],
  type: ["type", "income/expense", "tipe", "jenis", "income", "expense"],
};

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  for (const name of possibleNames) {
    const index = normalizedHeaders.findIndex(header => 
      header.includes(name.toLowerCase()) || name.toLowerCase().includes(header)
    );
    if (index !== -1) return index;
  }
  
  return -1;
}

function parseDate(dateValue: string | number | Date | null | undefined): Date {
  if (!dateValue) {
    throw new Error("Invalid date value");
  }

  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // If it's a number (Excel date serial)
  if (typeof dateValue === "number") {
    // Use XLSX utilities to parse Excel date
    const date = new Date((dateValue - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // If it's a string
  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    
    // Try DD/MM/YYYY format first (this is the expected format)
    const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, dayStr, monthStr, yearStr] = ddmmyyyy;
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      
      // Validate the date components
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900) {
        const date = new Date(year, month - 1, day);
        // Double-check that the date is valid
        if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
          return date;
        }
      }
    }
    
    // Try ISO format or other formats that Date.parse can handle
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  throw new Error(`Unable to parse date: ${dateValue} (type: ${typeof dateValue})`);
}

function parseAmount(amountValue: string | number | null | undefined): number {
  if (typeof amountValue === "number") {
    return Math.abs(amountValue); // Always return positive amount
  }
  
  if (typeof amountValue === "string") {
    // Remove currency symbols, spaces, and commas
    const cleaned = amountValue.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) {
      throw new Error(`Invalid amount: ${amountValue}`);
    }
    
    return Math.abs(parsed); // Always return positive amount
  }
  
  throw new Error(`Invalid amount type: ${typeof amountValue}`);
}

function parseTransactionType(typeValue: string | number | Date | null | undefined): "income" | "expense" {
  if (!typeValue) return "expense"; // Default to expense
  
  const typeStr = typeValue.toString().toLowerCase().trim();
  
  if (typeStr.includes("income") || typeStr.includes("masuk") || typeStr.includes("pendapatan")) {
    return "income";
  }
  
  if (typeStr.includes("exp") || typeStr.includes("expense") || typeStr.includes("keluar") || typeStr.includes("pengeluaran")) {
    return "expense";
  }
  
  // If unclear, default to expense
  return "expense";
}

function cleanCategoryName(categoryValue: string | number | Date | null | undefined): string {
  if (!categoryValue) return "Other";
  
  const cleaned = categoryValue.toString().trim();
  return cleaned || "Other";
}

function cleanDescription(descriptionValue: string | number | Date | null | undefined): string {
  if (!descriptionValue) return "Transaction";
  
  const cleaned = descriptionValue.toString().trim();
  return cleaned || "Transaction";
}

export async function parseExcelFile(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        // Parse the workbook
        const workbook = XLSX.read(data, { type: "binary" });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error("No worksheets found in the file"));
          return;
        }
        
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with array format
        const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: "",
        });
        
        if (jsonData.length < 2) {
          reject(new Error("File must contain at least a header row and one data row"));
          return;
        }
        
        // Get headers (first row)
        const headers = jsonData[0] as string[];
        
        // Find column indices
        const dateIndex = findColumnIndex(headers, COLUMN_MAPPINGS.date);
        const categoryIndex = findColumnIndex(headers, COLUMN_MAPPINGS.category);
        const descriptionIndex = findColumnIndex(headers, COLUMN_MAPPINGS.description);
        const amountIndex = findColumnIndex(headers, COLUMN_MAPPINGS.amount);
        const typeIndex = findColumnIndex(headers, COLUMN_MAPPINGS.type);
        
        if (dateIndex === -1 || categoryIndex === -1 || amountIndex === -1) {
          reject(new Error("Required columns not found. Please ensure your file has Date, Category, and Amount columns."));
          return;
        }
        
        // Parse data rows
        const transactions: ParsedTransaction[] = [];
        const errors: string[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // Skip empty rows
          if (!row || row.every(cell => !cell || cell.toString().trim() === "")) {
            continue;
          }
          
          try {
            const dateValue = row[dateIndex];
            const amountValue = row[amountIndex];
            const categoryValue = row[categoryIndex];
            
            
            const date = parseDate(dateValue as string | number | Date | null | undefined);
            const amount = parseAmount(amountValue as string | number | null | undefined);
            const categoryName = cleanCategoryName(categoryValue as string | number | Date | null | undefined);
            const description = cleanDescription(
              descriptionIndex !== -1 ? row[descriptionIndex] as string | number | Date | null | undefined : categoryName
            );
            const type = parseTransactionType(
              typeIndex !== -1 ? row[typeIndex] as string | number | Date | null | undefined : "expense"
            );
            
            // Validate that we have a proper Date object
            if (!(date instanceof Date) || isNaN(date.getTime())) {
              throw new Error(`Invalid date parsed: ${date}`);
            }
            
            transactions.push({
              date,
              amount,
              description,
              categoryName,
              type,
            });
            
          } catch (error) {
            console.error(`Error parsing row ${i + 1}:`, error);
            errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
        }
        
        if (transactions.length === 0) {
          reject(new Error("No valid transactions found in the file"));
          return;
        }
        
        if (errors.length > 0) {
          console.warn("Some rows had parsing errors:", errors);
        }
        
        // Sort by date (newest first) - ensure dates are valid Date objects
        transactions.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date.getTime() : 0;
          const dateB = b.date instanceof Date ? b.date.getTime() : 0;
          return dateB - dateA;
        });
        
        resolve(transactions);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsBinaryString(file);
  });
}