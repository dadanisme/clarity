"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  className,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");

  // Format the value for display
  React.useEffect(() => {
    if (value !== undefined && value !== null && value > 0) {
      setDisplayValue(formatCurrency(value));
    } else if (value === 0 || value === null || value === undefined) {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove all non-numeric characters
    const numericValue = inputValue.replace(/[^\d]/g, "");

    // Update the form value
    const parsedValue = parseFloat(numericValue) || 0;
    onChange?.(parsedValue);

    // Format and display in real-time
    if (numericValue) {
      setDisplayValue(formatCurrency(parsedValue));
    } else {
      setDisplayValue("");
    }
  };

  return (
    <Input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
