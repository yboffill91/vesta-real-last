import { TriangleAlertIcon } from "lucide-react";
import React from "react";
import { Button } from "./Buttons";
import Link from "next/link";
interface Props {
  alert: string;
  action: string;
  link: string;
}
export const DashboardCardAlert = ({ alert, action, link }: Props) => {
  return (
    <div>
      <div className="bg-yellow-500/10 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <TriangleAlertIcon className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-500">{alert}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Button variant="default" asChild>
          <Link href={link}>{action}</Link>
        </Button>
      </div>
    </div>
  );
};
