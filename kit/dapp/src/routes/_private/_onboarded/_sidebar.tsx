import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserDropdown } from "@/components/user-dropdown/user-dropdown";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/_sidebar")({
  component: LayoutComponent,
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    // Ensure both factory and addon lists are loaded for the sidebar navigation
    await Promise.all([
      queryClient.ensureQueryData(
        orpc.system.factory.list.queryOptions({
          input: {},
        })
      ),
      queryClient.ensureQueryData(
        orpc.system.addon.list.queryOptions({
          input: {},
        })
      ),
    ]);
  },
});

/**
 *
 */
function LayoutComponent() {
  return (
    <SidebarProvider className="OnboardedSidebar">
      <AppSidebar className="group-data-[side=left]:border-0" />
      <SidebarInset className="bg-sidebar">
        <header className="sticky top-0 z-50 flex justify-between w-full h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-sidebar">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="flex items-center gap-2 px-4">
            <UserDropdown />
          </div>
        </header>
        <main className="flex min-h-[calc(100vh-90px)] flex-1 flex-col rounded-tl-xl px-8 py-4 bg-background overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
