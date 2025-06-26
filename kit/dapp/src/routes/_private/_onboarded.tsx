import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <OnboardingGuard require="onboarded">
      <SidebarProvider>
        <AppSidebar className="group-data-[side=left]:border-0" />
        <SidebarInset className="bg-sidebar">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-sidebar">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>
          </header>
          <main className="flex min-h-[calc(100vh-90px)] flex-1 flex-col rounded-tl-xl px-8 py-4 bg-background">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </OnboardingGuard>
  );
}
