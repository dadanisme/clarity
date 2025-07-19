import { CheckCircle } from "lucide-react";
import { ParsedReceipt } from "@clarity/types/receipt";
import { formatCurrency } from "@/lib/utils";

interface ReceiptSummaryProps {
  parsedReceipt: ParsedReceipt;
}

export function ReceiptSummary({ parsedReceipt }: ReceiptSummaryProps) {
  return (
    <div className="border rounded-lg bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col sm:flex-row items-center space-x-2">
          <h4 className="font-semibold">Receipt Summary</h4>
          {parsedReceipt.timestamp && (
            <span className="text-sm text-muted-foreground">
              {parsedReceipt.timestamp}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4" />
          <span>{parsedReceipt.items.length} items found</span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-accent rounded-lg p-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-destructive">
            {formatCurrency(parsedReceipt.total)}
          </p>
        </div>
      </div>
    </div>
  );
}
