import { UserNav } from "@/components/dashboard/user-nav";
import { GoBack } from "@/components/dependientes/GoBack";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button, LogoutButton } from "@/components/ui";
import { Circle, Square } from "lucide-react";
import React, { ReactNode } from "react";

const DependientesLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="container max-w-7xl border rounded-lg h-[calc(100vh-16px)] overflow-auto p-6 mx-auto my-1 flex items-center justify-center relative">
      <div className="w-full overflow-auto h-full p-2">{children}</div>
      <div className="absolute bottom-0 left-0 w-full flex gap-2 bg-card rounded-b-lg py-2 items-center justify-evenly px-4">
        <div className="flex items-center">
          <GoBack />
          <Button variant="ghost" size={"icon"}>
            <Circle />
          </Button>
          <Button variant="ghost" size={"icon"}>
            <Square />
          </Button>
        </div>
        <div className="flex items-center jus-center gap-2">
          <div className="flex items-center justify-center rounded-lg border bg-background py-1 px-2">
            <ThemeToggle />
            <p className="text-sm">Cambiar Tema</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default DependientesLayout;
