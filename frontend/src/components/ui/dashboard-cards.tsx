import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardVariant } from "./Card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  variant?: CardVariant;
}

export const DashboardCards = ({
  title,
  icon: Icon,
  children,
  variant = "normal",
}: Props) => {
  return (
    <Card variant={variant} className="">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {Icon && (
          <Icon
            className={cn(
              "size-8 p-1 rounded-lg border",
              variant === "normal"
                ? "bg-accent text-accent-foreground"
                : variant === "info"
                ? "bg-blue-500 text-white"
                : "bg-destructive text-white"
            )}
          />
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
