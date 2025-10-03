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
import { orpc } from "@/orpc/orpc-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { parse, stringify } from "superjson";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  return getRouter();
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Only refetch on window focus in production to reduce development noise
        refetchOnWindowFocus: process.env.NODE_ENV === "production",

        // Disable background refetching to conserve resources
        refetchIntervalInBackground: false,

        // Offline-first strategy for better UX when network is unreliable
        networkMode: "offlineFirst",
        structuralSharing: true,
        retry: (failureCount, error) => {
          const queryError = error as { code?: string; status?: number };
          if (
            queryError.status &&
            queryError.status >= 400 &&
            queryError.status < 500 &&
            queryError.status !== 408
          ) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: 1000,
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnMount: (query) => {
          // Always refetch if invalidated
          if (query.state.isInvalidated) return true;
          // Otherwise, only refetch if this is the first fetch
          return query.state.dataUpdateCount === 0;
        },
      },
    },
  });

  const persister = createAsyncStoragePersister({
    storage:
      globalThis.window === undefined ? undefined : globalThis.localStorage,
    key: "atk-query-cache",
    throttleTime: 1000,
    serialize: (data) => stringify(data),
    deserialize: async (data) => parse(data),
  });

  if (
    globalThis.window !== undefined &&
    process.env.NODE_ENV !== "development"
  ) {
    const buildId = process.env.BUILD_ID ?? new Date().toISOString();
    void persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours,
      buster: buildId,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          return query.state.status === "success";
        },
      },
    });
  }

  if (globalThis.window !== undefined) {
    broadcastQueryClient({
      queryClient,
      broadcastChannel: "atk-query-sync",
    });
  }

  const router = createTanStackRouter({
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
     * Enable structural sharing for URL state.
     * This preserves referential stability when only parts of the state change,
     * reducing unnecessary re-renders.
     */
    defaultStructuralSharing: true,

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
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
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
    router: ReturnType<typeof getRouter>;
  }
}
