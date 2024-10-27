import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { PropsWithChildren, ReactNode } from "react";
import { AppSidebar } from "./_components/sidebar/app-sidebar";

export default function IssuerLayout({ children, breadcrumbs }: PropsWithChildren<{ breadcrumbs: ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar className="group-data-[side=left]:border-r-0" />
      <SidebarInset className="bg-sidebar">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs}
          </div>
        </header>
        <div className="flex-1 space-y-4 p-8 pt-6 rounded-tl-lg bg-background">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
