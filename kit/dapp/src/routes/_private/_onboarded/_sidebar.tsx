import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserDropdown } from "@/components/user-dropdown/user-dropdown";
import { authClient } from "@/lib/auth/auth.client";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/_sidebar")({
  component: LayoutComponent,
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    // Ensure factory list is loaded for the sidebar navigation
    await queryClient.ensureQueryData(
      orpc.token.factoryList.queryOptions({
        input: { hasTokens: true },
      })
    );
  },
});

/**
 *
 */
function LayoutComponent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <SidebarProvider className="OnboardingSidebar">
      <AppSidebar className="group-data-[side=left]:border-0" />
      <SidebarInset className="bg-sidebar">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-sidebar">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="flex items-center gap-2 px-4">
            <UserDropdown user={user} />
          </div>
        </header>
        <main className="flex min-h-[calc(100vh-90px)] flex-1 flex-col rounded-tl-xl px-8 py-4 bg-background">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
