/**
 * Private Dashboard Home Page
 *
 * This module defines the home page for authenticated users, serving as the
 * landing page after successful authentication. It demonstrates various data
 * fetching patterns available in TanStack Router with React Query.
 *
 * The page showcases:
 * - Accessing authenticated user data from route context
 * - Different data loading strategies (prefetch vs. ensure)
 * - Internationalization with react-i18next
 * - Suspense-based data fetching with React Query
 * @see {@link https://tanstack.com/router/latest/docs/guide/data-loading} - TanStack Router data loading
 * @see {@link https://tanstack.com/query/latest/docs/react/guides/suspense} - React Query suspense mode
 */

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { orpc } from "@/orpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/")({
  /**
   * Data loader that runs when navigating to this route.
   *
   * Demonstrates different data loading strategies:
   * 1. Accessing user data from parent route context
   * 2. Prefetching data for better perceived performance
   * 3. Ensuring data is loaded before rendering (blocking)
   * 4. Returning data or promises for component consumption
   *
   * The current implementation uses prefetchQuery for non-blocking
   * data loading, allowing the page to render while data loads.
   * @param root0
   * @param root0.context
   */
  loader: async ({ context }) => {
    // User data should be loaded in parent _private route, but we need to ensure it exists
    // to handle cache misses, invalidation, or direct navigation
    const user =
      context.queryClient.getQueryData(orpc.user.me.queryKey()) ??
      (await context.queryClient.ensureQueryData(orpc.user.me.queryOptions()));

    // Ensure systems data is loaded
    const systems = await context.queryClient.ensureQueryData(
      orpc.system.list.queryOptions({ input: {} })
    );

    return { user, systems };
  },
  component: Home,
});

/**
 * Home page component for authenticated users.
 *
 * Displays a welcome message and system data fetched via ORPC.
 * Uses suspense mode for data fetching, which integrates with
 * React Suspense boundaries for loading states.
 */
function Home() {
  const { user, systems } = Route.useLoaderData();

  return (
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
          <div className="p-2">
            <h3>{user.name}</h3>
            <pre>{JSON.stringify(systems, null, 2)}</pre>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
