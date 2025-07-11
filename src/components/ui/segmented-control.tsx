"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function SegmentedControl({
  value,
  onValueChange,
  options,
  className,
}: SegmentedControlProps) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsPrimitive.List className="flex h-10 w-full rounded-lg bg-gray-100 p-1">
        {options.map((option) => (
          <TabsPrimitive.Trigger
            key={option.value}
            value={option.value}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
            )}
          >
            {option.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
