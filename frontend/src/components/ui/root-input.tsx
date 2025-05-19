"use client";

import type React from "react";
import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Input, Label } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TriangleAlertIcon } from "lucide-react";

interface RootInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  htmlFor: string;
  error?: string;
}

const RootInput = forwardRef<HTMLInputElement, RootInputProps>(
  ({ label, htmlFor, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <motion.div
          className={cn(
            "grid border border-accent rounded-lg relative shadow bg-input",
            error && "border-destructive bg-destructive/20",
            className
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Label
            htmlFor={htmlFor}
            className={cn(
              "absolute -top-2 left-2 bg-card px-1 rounded",
              error && "text-destructive"
            )}
          >
            {label}
          </Label>
          <Input
            id={htmlFor}
            name={htmlFor}
            ref={ref}
            {...props}
            className="focus-visible:ring-0  bg-transparent shadow-none border-none px-2"
          />
          {error && (
            <motion.p
              className="text-xs bg-destructive rounded-b-lg inline-flex items-center justify-center gap-2 text-white "
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.p>
          )}
          {error && (
            <TriangleAlertIcon className="absolute top-1/2 -left-6 -translate-y-1/2 size-4 text-destructive" />
          )}
        </motion.div>
      </div>
    );
  }
);
RootInput.displayName = "RootInput";

export { RootInput };
