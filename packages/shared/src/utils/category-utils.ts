import type { Category } from "@clarity/types";

export function getCategoryColor(
  categoryName: string,
  categories?: Category[]
): string {
  const category = categories?.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.color || "#6b7280";
}
