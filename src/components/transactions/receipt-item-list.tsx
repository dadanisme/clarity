"use client";

import { ReceiptItem, ParsedReceipt, UserCategory } from "@/types/receipt";
import { ReceiptItemEditor } from "./receipt-item-editor";
import { SwipeActions } from "@/components/ui/swipe-actions";
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
              <SwipeActions
                showEditIndicator={true}
                showDeleteIndicator={true}
                onEdit={() => onStartEditing(index, item)}
                onDelete={() => onRemoveItem(index)}
              >
                <div className="p-4">
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
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
                      <p className="font-medium text-destructive">
                        {formatCurrency(item.amount)}
                      </p>
                      {item.tax > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{formatCurrency(item.tax)} tax
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="space-y-2">
                      <p className="font-medium truncate">{item.description}</p>
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-muted-foreground">
                          {item.category}
                        </p>
                        <div className="text-right">
                          <p className="font-medium text-destructive">
                            {formatCurrency(item.amount)}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {item.discount && (
                              <p className="text-success">
                                -{formatCurrency(item.discount)}
                              </p>
                            )}
                            {item.tax > 0 && (
                              <p>+{formatCurrency(item.tax)} tax</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwipeActions>
            )}
          </div>
        ))
      )}
    </div>
  );
}
