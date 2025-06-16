"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import type { PropsWithChildren } from "react";

// NavProvider is now a simple wrapper that renders SidebarProvider.
// SidebarProvider will handle its own mounted state for client-only rendering.
export default function NavProvider({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="SidebarProvider" defaultOpen={true}>
      {children}
    </SidebarProvider>
  );
}
