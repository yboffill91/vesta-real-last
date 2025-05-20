import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  BreadcrumbPath,
  Button,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* <BreadcrumbPath rootPath="/" /> */}
            <div>
              <Button asChild variant={"ghost"}>
                <Link href={"/"} className="inline-flex items-center">
                  <Image
                    src={"/logo.webp"}
                    width={32}
                    height={32}
                    alt="VestaSys"
                  />
                  <h3>VestaSys</h3>
                </Link>
              </Button>
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
