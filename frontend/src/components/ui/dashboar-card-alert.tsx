import { TriangleAlertIcon, AlertTriangle, CircleAlert } from "lucide-react";
import React from "react";
import { Button } from "./Buttons";
import Link from "next/link";
import { Card } from "./Card";

interface DashboardCardAlertProps {
  variant: "destructive" | "warning";
  title: string;
  alert: string;
  action?: string;
  link?: string;
}

export const DashboardCardAlert = ({
  variant,
  title,
  alert,
  action,
  link,
}: DashboardCardAlertProps) => {
  const colorStyles =
    variant === "destructive"
      ? {
          bg: "bg-red-500/10",
          border: "border-red-400",
          icon: "text-red-600",
          text: "text-red-500",
        }
      : {
          bg: "bg-yellow-500/10",
          border: "border-yellow-400",
          icon: "text-yellow-600",
          text: "text-yellow-500",
        };
  const Icon = variant === "destructive" ? CircleAlert : AlertTriangle;
  return (
    <div className="flex flex-col items-center justify-center gap-4 border rounded-lg p-2">
      <Card
        className={`${colorStyles.bg} border-l-4 ${colorStyles.border} p-4 rounded-lg w-full`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Icon className={`h-6 w-6 ${colorStyles.icon}`} />
          </div>
          <div className="ml-3">
            <h4 className={`font-semibold text-base mb-1 ${colorStyles.text}`}>
              {title}
            </h4>
            <p className={`text-sm ${colorStyles.text}`}>{alert}</p>
          </div>
        </div>
      </Card>
      {action && link && (
        <div className="mt-4">
          <Button variant="default" asChild>
            <Link href={link}>{action}</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
