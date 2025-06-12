import { ContextualSidebar } from "@/components/blocks/contextual-sidebar/contextual-sidebar";
import NavInset from "@/components/layout/nav-inset";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="SidebarProvider" defaultOpen={true}>
      <ContextualSidebar />
      <NavInset>{children}</NavInset>
    </SidebarProvider>
  );
}
