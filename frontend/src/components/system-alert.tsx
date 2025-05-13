"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export type SystemAlertVariant = "default" | "destructive"

type SystemAlertProps = {
  
  open: boolean
 
  setOpen: (open: boolean) => void
  
  title: string
 
  description: string
 
  confirmText?: string
 
  cancelText?: string

  onConfirm?: () => void

  onCancel?: () => void

  variant?: SystemAlertVariant
  
  className?: string
}


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
      onConfirm()
    }
    setOpen(false)
  }


  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className={cn(className, variant === "destructive" ? "bg-destructive" : "")}>
        <AlertDialogHeader>
          <AlertDialogTitle 
            className={cn(
              variant === "destructive" ? "text-destructive-foreground" : ""
            )}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className={cn(variant === "destructive" ? "text-destructive-foreground" : "")}>{description}</AlertDialogDescription>
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
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                : ""
            )}
            onClick={handleConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
