export interface ReceiptItem {
  amount: number;
  discount: number | null;
  tax: number;
  serviceFee: number;
  category: string;
  description: string;
}

export interface ParsedReceipt {
  items: ReceiptItem[];
  timestamp: string | null;
  rounding: number;
  currency: string;
  note: string;
}

export interface UserCategory {
  id: string;
  name: string;
  type: string;
  color: string;
}
