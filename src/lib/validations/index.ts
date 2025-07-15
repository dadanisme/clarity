import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().max(100, "Description too long").optional(),
  date: z.date(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  type: z.enum(["income", "expense"]),
  color: z.string().min(1, "Color is required"),
  isDefault: z.boolean().default(false),
});

export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
