"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface FloatingActionButtonProps {
  icon?: LucideIcon;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  show?: boolean;
}

/**
 * A reusable floating action button component for mobile devices.
 *
 * @example
 * // Simple icon button
 * <FloatingActionButton
 *   icon={Plus}
 *   onClick={() => console.log('clicked')}
 * />
 *
 * @example
 * // Custom content (e.g., with forms)
 * <FloatingActionButton>
 *   <TransactionForm mode="create" trigger={<CustomButton />} />
 * </FloatingActionButton>
 *
 * @example
 * // Conditional display
 * <FloatingActionButton show={shouldShow} icon={Plus} />
 */
export function FloatingActionButton({
  icon: Icon,
  onClick,
  children,
  className = "",
  show = true,
}: FloatingActionButtonProps) {
  if (!show) return null;

  return (
    <div className="md:hidden fixed bottom-24 right-4 z-50">
      {children ? (
        <div className={className}>{children}</div>
      ) : (
        <Button
          size="icon"
          onClick={onClick}
          className={`w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 ${className}`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </Button>
      )}
    </div>
  );
}
