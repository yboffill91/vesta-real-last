"use client"

import type React from "react"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(({ error, className, ...props }, ref) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Input ref={ref} className={cn(error && "border-destructive", className)} {...props} />
    </motion.div>
  )
})
AnimatedInput.displayName = "AnimatedInput"

export { AnimatedInput }
