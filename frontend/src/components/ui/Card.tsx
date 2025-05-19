import { cn } from "@/lib/utils";
import {
  Card as PrimitiveCard,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./primitive-card";
import { forwardRef } from "react";

export type CardVariant = "normal" | "warning" | "success" | "info";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "normal", ...props }, ref) => {
    const variantClasses = {
      normal: "bg-card",
      warning: "bg-destructive/20",
      success: "bg-green-500/20",
      info: "bg-blue-500/20",
    };

    return (
      <PrimitiveCard
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// Re-export all other components from primitive-card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
