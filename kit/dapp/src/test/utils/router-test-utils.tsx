import { routeTree } from "@/routeTree.gen";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from "@tanstack/react-router";
import type { ReactElement } from "react";
import { createTestQueryClient } from "./test-query-client";

interface CreateTestRouterOptions {
  initialLocation?: string;
  queryClient?: QueryClient;
  context?: Record<string, unknown>;
}

/**
 * Creates a test router with the generated route tree for testing
 */
export function createTestRouter({
  initialLocation = "/",
  queryClient = createTestQueryClient(),
  context = {},
}: CreateTestRouterOptions = {}) {
  const memoryHistory = createMemoryHistory({
    initialEntries: [initialLocation],
  });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
    context: {
      queryClient,
      ...context,
    },
  });

  return { router, queryClient };
}

interface RenderWithRouterOptions extends CreateTestRouterOptions {
  route?: string;
}

/**
 * Test wrapper component that provides router and query client
 */
export function TestRouterProvider({
  children,
  router,
  queryClient,
}: {
  children?: ReactElement;
  router: ReturnType<typeof createRouter>;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}>{children}</RouterProvider>
    </QueryClientProvider>
  );
}

/**
 * Creates a wrapper for rendering components with router context
 */
export function createRouterWrapper(options: RenderWithRouterOptions = {}) {
  const { router, queryClient } = createTestRouter(options);

  return {
    wrapper: ({ children }: { children: ReactElement }) => (
      <TestRouterProvider router={router} queryClient={queryClient}>
        {children}
      </TestRouterProvider>
    ),
    router,
    queryClient,
  };
}

/**
 * Helper to wait for navigation to complete
 */
export async function waitForNavigation(
  router: ReturnType<typeof createRouter>
) {
  await router.invalidate();
  // Wait for any pending navigations
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Helper to navigate and wait for completion
 */
export async function navigateTo(
  router: ReturnType<typeof createRouter>,
  to: string
) {
  await router.navigate({ to });
  await waitForNavigation(router);
}
