"use client";

import * as React from "react";
import { Button } from "@/components/ui/Buttons";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToggleButtonProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  activeText?: string;
  inactiveText?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ToggleButton({
  id,
  checked,
  onCheckedChange,
  activeIcon = <Check size={16} />,
  inactiveIcon = <X size={16} />,
  activeText,
  inactiveText,
  className,
  size = "default",
}: ToggleButtonProps) {
  return (
    <Button
      id={id}
      type="button"
      variant={checked ? "outline" : "destructive"}
      onClick={() => onCheckedChange(!checked)}
      className={cn("flex items-center gap-2", className)}
      size={size}
    >
      {checked ? activeIcon : inactiveIcon}
      {checked ? activeText : inactiveText}
    </Button>
  );
}
