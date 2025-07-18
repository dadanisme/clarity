"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/use-transactions";
import { transactionSchema } from "@/lib/validations";
import { Plus, Edit, Trash2 } from "lucide-react";

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
  const deleteTransaction = useDeleteTransaction();

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
          type: transaction.type as "income" | "expense",
          category_id: transaction.category_id,
          description: transaction.description || "",
          date: new Date(transaction.date),
        }
      : {
          amount: 0,
          type: "expense",
          category_id: "",
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

  const handleDelete = async () => {
    if (user?.id && transaction) {
      try {
        await deleteTransaction.mutateAsync({
          transactionId: transaction.id,
        });
        setOpen(false);
      } catch (error) {
        console.error("Delete failed:", error);
      }
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
        type: transaction.type as "income" | "expense",
        category_id: transaction.category_id,
        description: transaction.description || "",
        date: new Date(transaction.date),
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
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
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
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={watch("category_id")}
                onValueChange={(value) => setValue("category_id", value)}
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
              {errors.category_id && (
                <p className="text-sm text-destructive">
                  {errors.category_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Enter transaction description (optional)"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
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
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            {mode === "edit" && (
              <div className="flex space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 text-destructive hover:text-destructive/80 border-destructive/20 hover:border-destructive/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;
                        {transaction?.description}&quot;? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Updating..." : "Update Transaction"}
                </Button>
              </div>
            )}
            {mode === "create" && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
