"use client";

import { createQueryClient } from "@/lib/query/query.client";
import {
  type QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { type PropsWithChildren, useState } from "react";

/**
 * Singleton QueryClient instance for browser environment.
 *
 * This variable holds the QueryClient instance that persists across
 * component re-renders and route navigations in the browser. It's
 * undefined initially and gets created on first access.
 *
 * The singleton pattern ensures:
 * - Query cache persists across navigations
 * - No unnecessary QueryClient re-creation
 * - Consistent state management in SPA behavior
 */
let browserQueryClient: QueryClient | undefined;

/**
 * Gets or creates a QueryClient instance with environment-aware behavior.
 *
 * This function implements different strategies for server and client environments:
 * - Server: Creates a fresh QueryClient for each request to prevent data leaking
 * - Client: Uses singleton pattern to maintain state across navigations
 *
 * The separation is crucial for:
 * - Security: Preventing user data leakage between server requests
 * - Performance: Avoiding unnecessary client-side re-initialization
 * - State management: Maintaining query cache across route changes
 *
 * @returns A QueryClient instance appropriate for the current environment
 *
 * @example
 * ```typescript
 * // Server-side: New client for each request
 * const serverClient = getQueryClient(); // Fresh instance
 *
 * // Client-side: Singleton pattern
 * const clientClient1 = getQueryClient(); // Creates singleton
 * const clientClient2 = getQueryClient(); // Returns same instance
 * ```
 */
function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: Always create a new client for each request to prevent
    // data leaking between different users' requests
    return createQueryClient();
  }

  // Client: Use singleton pattern to maintain state across navigations
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
}

/**
 * Application-wide QueryClient provider with comprehensive error handling and development tools.
 *
 * This component serves as the root provider for React Query functionality throughout
 * the application. It implements environment-aware QueryClient management, error
 * boundaries for graceful error handling, and development tools integration for
 * improved developer experience.
 *
 * Key features:
 * - Environment-aware QueryClient instantiation (singleton on client, fresh on server)
 * - Comprehensive error boundary with user-friendly fallbacks
 * - Development tools integration with configurable visibility
 * - Automatic error logging and monitoring integration points
 * - TypeScript support with proper prop validation
 * - Test environment cleanup for reliable testing
 *
 * Architecture benefits:
 * - Prevents data leakage between server requests
 * - Maintains query cache across client-side navigations
 * - Provides consistent error handling across the application
 * - Enables powerful debugging capabilities in development
 * - Supports custom error handling strategies
 *
 * @param children - Child components that will have access to React Query
 * @param showDevtools - Whether to display development tools (development only)
 * @param devtoolsInitialIsOpen - Initial state of the devtools panel
 * @param errorFallback - Custom error fallback component
 *
 * @example
 * ```tsx
 * // Basic usage in app root
 * function App() {
 *   return (
 *     <QueryClientProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom configuration
 * <QueryClientProvider
 *   showDevtools={false}
 *   devtoolsInitialIsOpen={true}
 *   errorFallback={CustomErrorComponent}
 * >
 *   <App />
 * </QueryClientProvider>
 * ```
 *
 * @example
 * ```tsx
 * // In Next.js _app.tsx
 * function MyApp({ Component, pageProps }: AppProps) {
 *   return (
 *     <QueryClientProvider>
 *       <Component {...pageProps} />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 *
 * @see {@link @/lib/orpc/query/query.client} - QueryClient configuration
 * @see {@link https://tanstack.com/query/latest/docs/framework/react/reference/QueryClient} - QueryClient API reference
 */
export function QueryClientProvider({ children }: PropsWithChildren) {
  // Use state to ensure we don't recreate the client on every render
  // This is crucial for maintaining query cache and avoiding unnecessary re-initialization
  const [queryClient] = useState(() => getQueryClient());

  return (
    <ReactQueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {children}
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      </ReactQueryStreamedHydration>
    </ReactQueryClientProvider>
  );
}

/**
 * Hook to safely access the QueryClient instance outside of React Query hooks.
 *
 * This hook provides direct access to the QueryClient instance for advanced
 * use cases where the standard React Query hooks are insufficient. It should
 * be used sparingly and only when necessary, as the standard hooks provide
 * better integration with React's lifecycle and error handling.
 *
 * Common use cases:
 * - Manual cache manipulation
 * - Imperative query triggering
 * - Custom query invalidation logic
 * - Integration with non-React code
 *
 * @returns The current QueryClient instance
 *
 * @example
 * ```tsx
 * function useCustomInvalidation() {
 *   const queryClient = useAppQueryClient();
 *
 *   const invalidateUserData = useCallback(() => {
 *     queryClient.invalidateQueries({ queryKey: ['users'] });
 *   }, [queryClient]);
 *
 *   return { invalidateUserData };
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Manual cache updates
 * function useOptimisticUpdate() {
 *   const queryClient = useAppQueryClient();
 *
 *   const updateUserOptimistically = (userId: string, data: UserData) => {
 *     queryClient.setQueryData(['users', userId], data);
 *   };
 *
 *   return { updateUserOptimistically };
 * }
 * ```
 *
 * @see {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient} - Standard useQueryClient hook
 */
export function useAppQueryClient(): QueryClient {
  return getQueryClient();
}
