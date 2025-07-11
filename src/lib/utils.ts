import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Indonesian Rupiah (IDR)
 * @param amount - The amount to format
 * @returns Formatted string with Rupiah symbol and thousand separators
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number as Indonesian Rupiah (IDR) with sign for transactions
 * @param amount - The amount to format
 * @param type - Transaction type ("income" or "expense")
 * @returns Formatted string with sign and Rupiah symbol
 */
export function formatTransactionAmount(
  amount: number,
  type: "income" | "expense"
): string {
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatCurrency(amount)}`;
}
