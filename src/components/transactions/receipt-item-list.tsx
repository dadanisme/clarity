"use client";

import { ReceiptItem, ParsedReceipt, UserCategory } from "@/types/receipt";
import { ReceiptItemEditor } from "./receipt-item-editor";
import { SwipeActions } from "@/components/ui/swipe-actions";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReceiptItemListProps {
  parsedReceipt: ParsedReceipt;
  editingItem: number | null;
  editingValues: {
    description: string;
    amount: string;
    category: string;
  };
  userCategories?: UserCategory[];
  onStartEditing: (index: number, item: ReceiptItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemoveItem: (index: number) => void;
  onValueChange: (field: string, value: string) => void;
}

export function ReceiptItemList({
  parsedReceipt,
  editingItem,
  editingValues,
  userCategories,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onRemoveItem,
  onValueChange,
}: ReceiptItemListProps) {
  return (
    <div className="space-y-2">
      <h5 className="font-medium text-sm">
        Items Found ({parsedReceipt.items.length})
      </h5>
      {parsedReceipt.items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No items remaining</p>
          <p className="text-sm">All items have been removed</p>
        </div>
      ) : (
        parsedReceipt.items.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg bg-card hover:bg-accent transition-colors"
          >
            {editingItem === index ? (
              <ReceiptItemEditor
                index={index}
                item={item}
                editingValues={editingValues}
                userCategories={userCategories}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
                onValueChange={onValueChange}
              />
            ) : (
              <>
                {/* Mobile Layout with Swipe Actions */}
                <div className="sm:hidden">
                  <SwipeActions
                    showEditIndicator={true}
                    showDeleteIndicator={true}
                    onEdit={() => onStartEditing(index, item)}
                    onDelete={() => onRemoveItem(index)}
                  >
                    <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.category}
                            {item.discount && (
                              <span className="text-success ml-2">
                                -{formatCurrency(item.discount)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.discount && (
                            <span className="text-success">
                              -{formatCurrency(item.discount)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </SwipeActions>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.category}
                        {item.discount && (
                          <span className="text-success ml-2">
                            -{formatCurrency(item.discount)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-4">
                      <p className="font-medium">
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.discount && (
                          <span className="text-success">
                            -{formatCurrency(item.discount)}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStartEditing(index, item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
