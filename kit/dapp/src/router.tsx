/**
 * Application Router Configuration
 *
 * This module configures and exports the main TanStack Router instance for the application.
 * It integrates the router with React Query for seamless data fetching and caching,
 * and sets up default error handling and navigation behaviors.
 *
 * The router configuration includes:
 * - Integration with React Query for data management
 * - Default error boundary for handling runtime errors
 * - Not found component for 404 pages
 * - Intent-based preloading for better performance
 * - Type-safe routing through generated route tree
 * @see {@link https://tanstack.com/router/latest} - TanStack Router documentation
 * @see {@link https://tanstack.com/router/latest/docs/framework/react/guide/data-loading} - Router with Query integration
 */

import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { NotFound } from "@/components/error/not-found";
import { queryClient } from "@/lib/query.client";
import { orpc } from "@/orpc";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "./routeTree.gen";

/**
 * Creates and configures the application router.
 *
 * This factory function creates a TanStack Router instance with:
 * - React Query integration for coordinated data fetching
 * - Generated route tree for type-safe navigation
 * - Default error handling components
 * - Intent-based preloading strategy
 *
 * The router is wrapped with `routerWithQueryClient` to enable:
 * - Automatic query prefetching on route navigation
 * - Shared query client context between router and components
 * - Coordinated loading states between routing and data fetching
 * @returns Configured router instance with React Query integration
 * @example
 * ```tsx
 * // In your app entry point
 * import { createRouter } from './router';
 *
 * const router = createRouter();
 *
 * function App() {
 *   return <RouterProvider router={router} />;
 * }
 * ```
 */
export function createRouter() {
  return routerWithQueryClient(
    createTanStackRouter({
      /**
       * Generated route tree containing all application routes.
       * This is auto-generated from the routes directory structure.
       */
      routeTree,

      /**
       * Global context available to all routes.
       * Includes the query client for data fetching operations.
       */
      context: { queryClient, orpc },

      /**
       * Default preloading strategy.
       * "intent" preloads routes when users hover or focus on links,
       * improving perceived performance.
       */
      defaultPreload: "intent",
      defaultPreloadStaleTime: 0,

      /**
       * Default error boundary component.
       * Handles uncaught errors in route components.
       */
      defaultErrorComponent: DefaultCatchBoundary,

      /**
       * Default not found component.
       * Displayed when no matching route is found.
       */
      defaultNotFoundComponent: () => <NotFound />,
    }),
    queryClient
  );
}

/**
 * TypeScript module augmentation for router type safety.
 *
 * This declaration extends TanStack Router's types to include
 * our specific router configuration, enabling:
 * - Type-safe route parameters
 * - Autocomplete for route paths
 * - Type checking for navigation methods
 *
 * The router type is automatically inferred from the createRouter
 * function, ensuring type safety throughout the application.
 */
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
