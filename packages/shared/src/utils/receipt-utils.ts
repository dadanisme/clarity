import { ReceiptItem } from "@clarity/types/receipt";

// Calculate total from items
export function calculateTotal(items: ReceiptItem[]): number {
  return items.reduce((sum, item) => {
    const itemTotal =
      item.amount - (item.discount || 0) + item.tax + item.serviceFee;
    return sum + itemTotal;
  }, 0);
}

// Try to parse timestamp
export function parseTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null;

  try {
    // Try to parse as ISO date first
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return timestamp;
    }
  } catch {
    // If parsing fails, use as is
    return timestamp;
  }

  return timestamp;
}
