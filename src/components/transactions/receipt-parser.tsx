"use client";

import { useState, useRef } from "react";
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
import { Camera, Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  uploadReceiptImage,
  deleteReceiptImage,
} from "@/lib/firebase/services";

interface ReceiptItem {
  amount: number;
  discount: number | null;
  tax: number;
  serviceFee: number;
  category: string;
  description: string;
}

interface ParsedReceipt {
  items: ReceiptItem[];
  timestamp: string | null;
  rounding: number;
  total: number;
  currency: string;
  note: string;
}

interface ReceiptParserProps {
  onReceiptParsed: (
    items: ReceiptItem[],
    total: number,
    timestamp: string | null
  ) => void;
  trigger?: React.ReactNode;
  userCategories?: Array<{
    id: string;
    name: string;
    type: string;
    color: string;
  }>;
  userId?: string;
}

export function ReceiptParser({
  onReceiptParsed,
  trigger,
  userCategories,
  userId,
}: ReceiptParserProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userOrder, setUserOrder] = useState("");
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleParseReceipt = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsLoading(true);
    try {
      // First, upload the image to Firebase Storage
      const imageUrl = await uploadReceiptImage(
        userId || "temp",
        selectedImage
      );

      // Then send the URL to the API
      const response = await fetch("/api/parse-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          userOrder,
          userCategories,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse receipt");
      }

      const data = await response.json();
      setParsedReceipt(data);
      toast.success("Receipt parsed successfully!");

      // Clean up the uploaded image after successful parsing
      await deleteReceiptImage(imageUrl);
    } catch (error) {
      console.error("Error parsing receipt:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to parse receipt"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseParsedData = () => {
    if (!parsedReceipt) return;

    // Convert parsed items to transaction format
    const items = parsedReceipt.items;
    const total = parsedReceipt.total;

    // Try to parse timestamp
    let timestamp: string | null = null;
    if (parsedReceipt.timestamp) {
      try {
        // Try to parse as ISO date first
        const date = new Date(parsedReceipt.timestamp);
        if (!isNaN(date.getTime())) {
          timestamp = parsedReceipt.timestamp;
        }
      } catch {
        // If parsing fails, use as is
        timestamp = parsedReceipt.timestamp;
      }
    }

    onReceiptParsed(items, total, timestamp);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUserOrder("");
    setParsedReceipt(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          <div className="space-y-4">
            <Label>Receipt Image</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

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
            onClick={handleParseReceipt}
            disabled={!selectedImage || isLoading}
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
              <div className="border rounded-lg bg-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Receipt Summary</h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    <span>{parsedReceipt.items.length} items found</span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-accent rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold text-destructive">
                      {parsedReceipt.currency}{" "}
                      {parsedReceipt.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {parsedReceipt.timestamp && (
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{parsedReceipt.timestamp}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Currency</p>
                    <p className="font-medium">{parsedReceipt.currency}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Items Found</h5>
                {parsedReceipt.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.category}
                          {item.discount && (
                            <span className="text-success ml-2">
                              -{parsedReceipt.currency}{" "}
                              {item.discount.toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-destructive">
                        {parsedReceipt.currency} {item.amount.toLocaleString()}
                      </p>
                      {item.tax > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{parsedReceipt.currency} {item.tax.toLocaleString()}{" "}
                          tax
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              {parsedReceipt.note && (
                <div className="border rounded-lg bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    {parsedReceipt.note}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <Button onClick={handleUseParsedData} className="w-full">
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
