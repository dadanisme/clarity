"use client";
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, className, ...props }, ref) => (
    <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <SwitchPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=checked]:bg-success data-[state=unchecked]:bg-destructive",
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
      </SwitchPrimitive.Root>
      {label && <span className="select-none text-sm">{label}</span>}
    </label>
  )
);
Switch.displayName = "Switch";
