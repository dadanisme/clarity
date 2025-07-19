"use client";

import {
  SwipeableList,
  SwipeableListItem,
  TrailingActions,
  LeadingActions,
  SwipeAction,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import { cn } from "@/lib/utils";
import { Edit3, Trash2 } from "lucide-react";

interface SwipeActionsProps {
  children: React.ReactNode;
  showEditIndicator?: boolean;
  showDeleteIndicator?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SwipeActions({
  children,
  showEditIndicator = false,
  showDeleteIndicator = false,
  onEdit,
  onDelete,
  className,
}: SwipeActionsProps) {
  const leadingActionsComponent = showEditIndicator ? (
    <LeadingActions>
      <SwipeAction onClick={onEdit || (() => {})}>
        <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground px-6">
          <Edit3 className="w-5 h-5" />
        </div>
      </SwipeAction>
    </LeadingActions>
  ) : undefined;

  const trailingActionsComponent = showDeleteIndicator ? (
    <TrailingActions>
      <SwipeAction onClick={onDelete || (() => {})}>
        <div className="flex items-center justify-center w-full h-full bg-destructive text-destructive-foreground px-6">
          <Trash2 className="w-5 h-5" />
        </div>
      </SwipeAction>
    </TrailingActions>
  ) : undefined;

  return (
    <SwipeableList className={cn("w-full", className)}>
      <SwipeableListItem
        leadingActions={leadingActionsComponent}
        trailingActions={trailingActionsComponent}
        threshold={0.5}
      >
        <div className="bg-card w-full">{children}</div>
      </SwipeableListItem>
    </SwipeableList>
  );
}
