"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  uploadReceiptImage,
  deleteReceiptImage,
} from "@/lib/firebase/services";
import { ReceiptItem, ParsedReceipt, UserCategory } from "@/types/receipt";
import { calculateTotal } from "@/lib/utils/receipt-utils";
import { useImageUpload } from "./use-image-upload";

interface UseReceiptParserProps {
  userCategories?: UserCategory[];
  userId?: string;
}

export function useReceiptParser({
  userCategories,
  userId,
}: UseReceiptParserProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userOrder, setUserOrder] = useState("");
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(
    null
  );
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<{
    description: string;
    amount: string;
    category: string;
  }>({
    description: "",
    amount: "",
    category: "",
  });

  const { selectedImage, imagePreview, handleImageSelect, clearImage } =
    useImageUpload();

  // Update total when items change
  const updateTotal = (items: ReceiptItem[]) => {
    if (!parsedReceipt) return;
    const newTotal = calculateTotal(items);
    setParsedReceipt({
      ...parsedReceipt,
      items,
      total: newTotal,
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    if (!parsedReceipt) return;
    const newItems = parsedReceipt.items.filter((_, i) => i !== index);
    updateTotal(newItems);
    toast.success("Item removed");
  };

  // Start editing item
  const startEditing = (index: number, item: ReceiptItem) => {
    setEditingItem(index);
    setEditingValues({
      description: item.description,
      amount: item.amount.toString(),
      category: item.category,
    });
  };

  // Save edited item
  const saveEdit = () => {
    if (editingItem === null || !parsedReceipt) return;

    const amount = parseFloat(editingValues.amount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!editingValues.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    const newItems = [...parsedReceipt.items];
    newItems[editingItem] = {
      ...newItems[editingItem],
      description: editingValues.description.trim(),
      amount: amount,
      category: editingValues.category,
    };

    updateTotal(newItems);
    setEditingItem(null);
    setEditingValues({ description: "", amount: "", category: "" });
    toast.success("Item updated successfully");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setEditingValues({ description: "", amount: "", category: "" });
  };

  // Parse receipt
  const parseReceipt = async () => {
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

  // Reset form
  const resetForm = () => {
    clearImage();
    setUserOrder("");
    setParsedReceipt(null);
    setEditingItem(null);
    setEditingValues({ description: "", amount: "", category: "" });
  };

  // Update editing values
  const updateEditingValues = (field: string, value: string) => {
    setEditingValues({
      ...editingValues,
      [field]: value,
    });
  };

  return {
    // State
    isLoading,
    selectedImage,
    imagePreview,
    userOrder,
    parsedReceipt,
    editingItem,
    editingValues,

    // Actions
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
  };
}
