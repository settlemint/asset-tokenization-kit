import { SidebarProvider } from "@/components/ui/sidebar";
import type { CSSProperties, PropsWithChildren } from "react";

export default function NavProvider({ children }: PropsWithChildren) {
  return (
    <SidebarProvider
      className="SidebarProvider"
      style={{ "--sidebar-width-icon": "4.5rem" } as CSSProperties}
    >
      {children}
    </SidebarProvider>
  );
}
