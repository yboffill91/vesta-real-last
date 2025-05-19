import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  BreadcrumbPath,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbPath rootPath="/" />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
