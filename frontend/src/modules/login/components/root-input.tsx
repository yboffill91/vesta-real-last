"use client"

import type React from "react"
import { forwardRef } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface RootInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  htmlFor: string
  error?: string
}

const RootInput = forwardRef<HTMLInputElement, RootInputProps>(
  ({ label, htmlFor, error, className, ...props }, ref) => {
    return (
      <motion.div
        className="grid gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Label htmlFor={htmlFor}>{label}</Label>
        <Input
          id={htmlFor}
          name={htmlFor}
          ref={ref}
          className={cn(error && "border-destructive", className)}
          {...props}
        />
        {error && (
          <motion.p
            className="text-xs text-destructive"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    )
  },
)
RootInput.displayName = "RootInput"

export { RootInput }
