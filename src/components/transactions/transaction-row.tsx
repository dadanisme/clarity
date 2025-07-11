import { TransactionForm } from "./transaction-form";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { format } from "date-fns";
import { formatTransactionAmount } from "@/lib/utils";
import { Transaction } from "@/types";

export function TransactionRow({
  transaction,
  getCategoryName,
  getCategoryColor,
}: {
  transaction: Transaction;
  getCategoryName: (id: string) => string;
  getCategoryColor: (id: string) => string;
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
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
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
          </div>
        </div>
      </div>
    </div>
  );
}
