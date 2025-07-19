"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
  categoryName: string;
  type: "income" | "expense";
}

interface TransactionPreviewTableProps {
  transactions: ParsedTransaction[];
  maxRows?: number;
}

export function TransactionPreviewTable({ 
  transactions, 
  maxRows = 10 
}: TransactionPreviewTableProps) {
  const displayTransactions = transactions.slice(0, maxRows);
  const hasMore = transactions.length > maxRows;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = (type: "income" | "expense") => {
    return type === "income" ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getTypeBadge = (type: "income" | "expense") => {
    return (
      <Badge 
        variant={type === "income" ? "default" : "secondary"}
        className={
          type === "income" 
            ? "bg-green-100 text-green-800 hover:bg-green-100" 
            : "bg-red-100 text-red-800 hover:bg-red-100"
        }
      >
        {type === "income" ? "Income" : "Expense"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/50">
          <h4 className="font-medium">Transaction Preview</h4>
          <p className="text-sm text-muted-foreground">
            Showing {displayTransactions.length} of {transactions.length} transactions
            {hasMore && ` (first ${maxRows} shown)`}
          </p>
        </div>
        
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead className="w-[120px] text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTransactions.map((transaction, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">
                    {format(transaction.date, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      <span className="truncate max-w-[200px]" title={transaction.description}>
                        {transaction.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-sm">
                      {transaction.categoryName}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(transaction.type)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={
                      transaction.type === "income" 
                        ? "text-green-600 font-medium" 
                        : "text-red-600"
                    }>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      {hasMore && (
        <div className="text-center py-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            ... and {transactions.length - maxRows} more transactions
          </p>
        </div>
      )}
    </div>
  );
}