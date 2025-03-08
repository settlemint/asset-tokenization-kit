import { SidebarInset } from "@/components/ui/sidebar";
import type { PropsWithChildren } from "react";
import Header from "./header";

export default function NavInset({ children }: PropsWithChildren) {
  return (
    <SidebarInset className="bg-sidebar">
      <Header />
      <main className="flex min-h-[calc(100vh-90px)] flex-1 flex-col rounded-tl-xl bg-background py-4 px-8">
        {children}
      </main>
    </SidebarInset>
  );
}
