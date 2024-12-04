import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import type { PropsWithChildren, ReactNode } from 'react';

export default function IssuerLayout({
  children,
  breadcrumbs,
  sidebar,
}: PropsWithChildren<{ breadcrumbs: ReactNode; sidebar: ReactNode }>) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset className="bg-sidebar">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs}
          </div>
        </header>
        <div className="flex-1 space-y-4 rounded-tl-lg bg-background p-8 pt-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
