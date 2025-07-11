"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, Camera } from "lucide-react";
import { ReceiptImageUpload } from "./receipt-image-upload";
import { ReceiptSummary } from "./receipt-summary";
import { ReceiptItemList } from "./receipt-item-list";
import { useReceiptParser } from "@/hooks/use-receipt-parser";
import { ReceiptItem, UserCategory } from "@/types/receipt";
import { parseTimestamp } from "@/lib/utils/receipt-utils";

interface ReceiptParserProps {
  onReceiptParsed: (
    items: ReceiptItem[],
    total: number,
    timestamp: string | null
  ) => void;
  trigger?: React.ReactNode;
  userCategories?: UserCategory[];
  userId?: string;
}

export function ReceiptParser({
  onReceiptParsed,
  trigger,
  userCategories,
  userId,
}: ReceiptParserProps) {
  const [open, setOpen] = useState(false);

  const {
    isLoading,
    imagePreview,
    userOrder,
    parsedReceipt,
    editingItem,
    editingValues,
    setUserOrder,
    handleImageSelect,
    clearImage,
    parseReceipt,
    resetForm,
    removeItem,
    startEditing,
    saveEdit,
    cancelEdit,
    updateEditingValues,
  } = useReceiptParser({ userCategories, userId });

  const handleUseParsedData = () => {
    if (!parsedReceipt) return;

    // Convert parsed items to transaction format
    const items = parsedReceipt.items;
    const total = parsedReceipt.total;

    // Try to parse timestamp
    const timestamp = parseTimestamp(parsedReceipt.timestamp);

    onReceiptParsed(items, total, timestamp);
    setOpen(false);
    resetForm();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Parse Receipt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Parse Receipt</DialogTitle>
          <DialogDescription>
            Upload a receipt image and optionally specify what you ordered to
            automatically extract transaction details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload */}
          <ReceiptImageUpload
            imagePreview={imagePreview}
            onImageSelect={handleImageSelect}
            onImageClear={clearImage}
          />

          {/* User Order Input */}
          <div className="space-y-2">
            <Label htmlFor="userOrder">What did you order? (Optional)</Label>
            <Textarea
              id="userOrder"
              placeholder="e.g., mie diskon, lemon, cup"
              value={userOrder}
              onChange={(e) => setUserOrder(e.target.value)}
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to parse all items from the receipt
            </p>
          </div>

          {/* Parse Button */}
          <Button
            onClick={parseReceipt}
            disabled={!imagePreview || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parsing Receipt...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Parse Receipt
              </>
            )}
          </Button>

          {/* Parsed Results */}
          {parsedReceipt && (
            <div className="space-y-4">
              {/* Summary Card */}
              <ReceiptSummary parsedReceipt={parsedReceipt} />

              {/* Items List */}
              <ReceiptItemList
                parsedReceipt={parsedReceipt}
                editingItem={editingItem}
                editingValues={editingValues}
                userCategories={userCategories}
                onStartEditing={startEditing}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onRemoveItem={removeItem}
                onValueChange={updateEditingValues}
              />

              {/* Note */}
              {parsedReceipt.note && (
                <div className="border rounded-lg bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    {parsedReceipt.note}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleUseParsedData}
                disabled={parsedReceipt.items.length === 0}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create {parsedReceipt.items.length} Transaction
                {parsedReceipt.items.length !== 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
