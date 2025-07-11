"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle } from "lucide-react";
import { ReceiptItem, UserCategory } from "@/types/receipt";

interface ReceiptItemEditorProps {
  index: number;
  item: ReceiptItem;
  editingValues: {
    description: string;
    amount: string;
    category: string;
  };
  userCategories?: UserCategory[];
  onSave: () => void;
  onCancel: () => void;
  onValueChange: (field: string, value: string) => void;
}

export function ReceiptItemEditor({
  index,
  editingValues,
  userCategories,
  onSave,
  onCancel,
  onValueChange,
}: ReceiptItemEditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="font-medium text-sm">Editing Item</h6>
          <p className="text-xs text-muted-foreground">
            Press Cmd+Enter to save, Esc to cancel
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={onSave}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <XCircle className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor={`description-${index}`} className="text-xs">
            Description
          </Label>
          <Input
            id={`description-${index}`}
            value={editingValues.description}
            onChange={(e) => onValueChange("description", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Item description"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`amount-${index}`} className="text-xs">
              Amount
            </Label>
            <Input
              id={`amount-${index}`}
              type="number"
              step="0.01"
              min="0"
              value={editingValues.amount}
              onChange={(e) => onValueChange("amount", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor={`category-${index}`} className="text-xs">
              Category
            </Label>
            <Select
              value={editingValues.category}
              onValueChange={(value) => onValueChange("category", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {userCategories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
