"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/providers/auth-provider";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { transactionSchema } from "@/lib/validations";
import { Plus, Edit } from "lucide-react";

import { DatePicker } from "@/components/ui/date-picker";
import type { Transaction } from "@/types";
import type { TransactionFormData } from "@/lib/validations";

interface TransactionFormProps {
  transaction?: Transaction;
  mode: "create" | "edit";
  trigger?: React.ReactNode;
  defaultDate?: Date;
}

export function TransactionForm({
  transaction,
  mode,
  trigger,
  defaultDate,
}: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: categories = [] } = useCategories(user?.id || "");
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          amount: transaction.amount,
          type: transaction.type,
          categoryId: transaction.categoryId,
          description: transaction.description || "",
          date: transaction.date,
        }
      : {
          amount: 0,
          type: "expense",
          categoryId: "",
          description: "",
          date: defaultDate || new Date(),
        },
  });

  const watchedType = watch("type");
  const filteredCategories = categories.filter(
    (cat) => cat.type === watchedType
  );

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (mode === "create" && user?.id) {
        await createTransaction.mutateAsync({
          userId: user.id,
          data,
        });
      } else if (mode === "edit" && user?.id && transaction) {
        await updateTransaction.mutateAsync({
          userId: user.id,
          transactionId: transaction.id,
          data,
        });
      }

      setOpen(false);
      reset();
    } catch (error) {
      console.error("Transaction save failed:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    } else if (newOpen && transaction && mode === "edit") {
      // Reset form with transaction data when opening in edit mode
      reset({
        amount: transaction.amount,
        type: transaction.type,
        categoryId: transaction.categoryId,
        description: transaction.description || "",
        date: transaction.date,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {mode === "create" ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Transaction" : "Edit Transaction"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new transaction to track your finances."
              : "Update the transaction details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (IDR)</Label>
            <CurrencyInput
              id="amount"
              value={watch("amount")}
              onChange={(value) => setValue("amount", value)}
              placeholder="0"
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Type and Category */}
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="type">Type</Label>
              <Select
                value={watchedType}
                onValueChange={(value: "income" | "expense") =>
                  setValue("type", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={watch("categoryId")}
                onValueChange={(value) => setValue("categoryId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description (optional)"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <DatePicker
              value={watch("date")}
              onChange={(date) => setValue("date", date)}
              placeholder="Select transaction date"
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Adding..."
                  : "Updating..."
                : mode === "create"
                ? "Add Transaction"
                : "Update Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
