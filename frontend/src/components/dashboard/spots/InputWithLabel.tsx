"use client";

import { Input, Label } from "@/components/ui";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputWithLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputWithLabel = forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="grid gap-2">
        <Label htmlFor={props.id || props.name}>{label}</Label>
        <Input
          ref={ref}
          className={cn(
            error ? "border-red-500 focus-visible:ring-red-500" : "",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);
InputWithLabel.displayName = "InputWithLabel";

export { InputWithLabel };
