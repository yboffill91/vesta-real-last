"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { TriangleAlertIcon } from "lucide-react";

export type SystemAlertVariant = "default" | "destructive";

type SystemAlertProps = {
  open: boolean;

  setOpen: (open: boolean) => void;

  title: string;

  description: string;

  confirmText?: string;

  cancelText?: string;

  onConfirm?: () => void;

  onCancel?: () => void;

  variant?: SystemAlertVariant;

  className?: string;
};

export function SystemAlert({
  open,
  setOpen,
  title,
  description,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
  variant = "default",
  className,
}: SystemAlertProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    setOpen(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent
        className={cn(
          "bg-card",
          className,
          variant === "destructive" && "border-s-6 border-destructive"
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className={cn(
              "flex items-center gap-2",
              variant === "destructive" ? "text-destructive-foreground" : ""
            )}
          >
            {variant === "destructive" && (
              <TriangleAlertIcon className="h-5 w-5 text-destructive" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            className={cn(
              variant === "destructive" ? "text-destructive-foreground" : ""
            )}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelText && (
            <AlertDialogCancel onClick={handleCancel}>
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            className={cn(
              variant === "destructive"
                ? "bg-destructive/80 text-destructive-foreground hover:bg-destructive"
                : ""
            )}
            onClick={handleConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
