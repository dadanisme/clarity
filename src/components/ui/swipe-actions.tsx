"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwipeAction {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  icon?: React.ReactNode;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  actions: SwipeAction[];
  className?: string;
}

export function SwipeActions({
  children,
  actions,
  className,
}: SwipeActionsProps) {
  const [translateX, setTranslateX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 120;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      setStartX(e.touches[0].clientX);
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const currentTouchX = e.touches[0].clientX;
      const deltaX = startX - currentTouchX;

      if (deltaX > 0) {
        const newTranslateX = Math.min(deltaX, MAX_SWIPE);
        setTranslateX(newTranslateX);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);

      if (translateX > SWIPE_THRESHOLD) {
        setTranslateX(MAX_SWIPE);
      } else {
        setTranslateX(0);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, startX, translateX]);

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setTranslateX(0);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Actions Background */}
      <div
        ref={actionsRef}
        className="absolute right-0 top-0 h-full flex items-center bg-muted"
        style={{
          width: `${MAX_SWIPE}px`,
          transform: `translateX(${MAX_SWIPE - translateX}px)`,
        }}
      >
        <div className="flex gap-1 px-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              variant={action.variant || "outline"}
              onClick={() => handleActionClick(action)}
              className="h-8 px-3 text-xs"
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="relative bg-card transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(-${translateX}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
