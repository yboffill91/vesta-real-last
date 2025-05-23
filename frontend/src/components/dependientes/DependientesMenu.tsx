"use client";
import { LogoutButton } from "../ui";
import { ThemeToggle } from "../ThemeToggle";
import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const DependientesMenu = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const clickHandler = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div
      className={cn(
        "flex flex-col items-end gap-2 absolute top-0 right-0 rounded-lg border p-2 bg-card transition-all duration-500 ease-in-out",
        className
      )}
    >
      <X
        className={cn(
          isOpen ? "" : "rotate-45",
          "transition-all duration-500 ease-in-out"
        )}
        onClick={clickHandler}
      />
      {isOpen && (
        <div className="flex items-center gap-2  ">
          <LogoutButton variant="default" />
          <ThemeToggle />
        </div>
      )}
    </div>
  );
};
