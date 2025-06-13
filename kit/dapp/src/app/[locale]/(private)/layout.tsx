import { ContextualSidebar } from "@/components/blocks/contextual-sidebar/contextual-sidebar";
import Header from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="SidebarProvider">
      <ContextualSidebar />
      <SidebarInset className="bg-sidebar">
        <Header />
        <main className="flex min-h-[calc(100vh-90px)] flex-1 flex-col rounded-tl-xl bg-background p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
