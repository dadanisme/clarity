import { TransactionForm } from "./transaction-form";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatTransactionAmount } from "@/lib/utils";
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
import { Transaction } from "@/types";

export function TransactionRow({
  transaction,
  getCategoryName,
  getCategoryColor,
  handleDelete,
}: {
  transaction: Transaction;
  getCategoryName: (id: string) => string;
  getCategoryColor: (id: string) => string;
  handleDelete: (id: string) => void;
}) {
  return (
    <div className="relative">
      {/* Mobile click-to-edit overlay */}
      <TransactionForm
        transaction={transaction}
        mode="edit"
        trigger={<div className="block md:hidden absolute inset-0 z-10" />}
      />
      {/* Row content */}
      <div className="flex items-center justify-between p-4 border rounded-lg md:cursor-default cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getCategoryColor(transaction.categoryId),
            }}
          />
          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-gray-500">
              {getCategoryName(transaction.categoryId)} •{" "}
              {format(transaction.date, "MMM dd, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p
              className={`font-medium ${
                transaction.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatTransactionAmount(transaction.amount, transaction.type)}
            </p>
          </div>
          <div className="flex space-x-1">
            {/* Desktop edit button */}
            <TransactionForm
              transaction={transaction}
              mode="edit"
              trigger={
                <Button variant="ghost" className="hidden md:flex">
                  <Edit className="w-4 h-4" />
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;
                    {transaction.description}&quot;? This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(transaction.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
