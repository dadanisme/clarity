import type { Category } from "@/types";

interface ReceiptItem {
  amount: number;
  discount: number | null;
  tax: number;
  serviceFee: number;
  category: string;
  description: string;
}

export function mapReceiptCategoryToUserCategory(
  receiptCategory: string,
  userCategories: Category[]
): string {
  // Since Gemini now returns exact category names from user's list,
  // we can do a direct match
  const matchingCategory = userCategories.find(
    (cat) => cat.name.toLowerCase() === receiptCategory.toLowerCase()
  );

  if (matchingCategory) {
    return matchingCategory.id;
  }

  // Fallback to fuzzy matching if exact match fails
  const similarCategory = userCategories.find(
    (userCat) =>
      userCat.name.toLowerCase().includes(receiptCategory.toLowerCase()) ||
      receiptCategory.toLowerCase().includes(userCat.name.toLowerCase())
  );

  if (similarCategory) {
    return similarCategory.id;
  }

  // Default to first expense category if no match found
  const defaultExpenseCategory = userCategories.find(
    (cat) => cat.type === "expense"
  );
  return defaultExpenseCategory?.id || "";
}

export function createTransactionsFromReceipt(
  items: ReceiptItem[],
  userCategories: Category[],
  userId: string,
  date: Date = new Date()
) {
  return items.map((item) => ({
    amount: item.amount,
    type: "expense" as const,
    category_id: mapReceiptCategoryToUserCategory(item.category, userCategories),
    description: item.description,
    date,
    userId,
  }));
}
