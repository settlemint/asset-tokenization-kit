import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, type QueryKey } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { cache } from 'react';

/**
 * Define a type for the mutation meta information that will be used for automatic query invalidation
 */
export type MutationMeta = {
  /**
   * Array of query keys that should be invalidated after the mutation succeeds
   * Each item can be a string or an array that matches the query key structure
   * React Query will automatically match by prefix, so:
   * - ['users'] will invalidate ['users'], ['users', '123'], ['users', 'list'], etc.
   * - ['user', '123'] will invalidate ['user', '123'], ['user', '123', 'details'], etc.
   * - ['stablecoin'] will invalidate all stablecoin-related queries
   */
  invalidates?: QueryKey[];
};

/**
 * Utility function to manually invalidate queries
 * This can be used directly in components or in success handlers
 *
 * @param queryKeysToInvalidate - Array of query keys to invalidate
 * @example
 * ```tsx
 * // Invalidate all stablecoin queries
 * invalidateQueries([['stablecoin']]);
 *
 * // Invalidate multiple query types
 * invalidateQueries([
 *   ['stablecoin', '0x123'], // Specific stablecoin
 *   ['user', userId, 'assets'] // User's assets
 * ]);
 * ```
 */
export function invalidateQueries(
  queryClient: QueryClient,
  queryKeysToInvalidate: QueryKey[]
): void {
  queryKeysToInvalidate.forEach((queryKey) => {
    // Try both exact and non-exact invalidation for thoroughness
    void queryClient.invalidateQueries({
      queryKey,
      refetchActive: true,
      refetchInactive: true, // Also refetch inactive queries
      stale: true,
      exact: false,
    });

    // Force refetch for exact matches too
    queryClient.getQueriesData({ queryKey }).forEach(([exactKey]) => {
      void queryClient.refetchQueries(
        { queryKey: exactKey, exact: true },
        { throwOnError: false }
      );
    });
  });
}

const getQueryClient = cache(() => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        networkMode: 'online',
        retry: 3, // Retry failed requests 3 times
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: 3, // Retry failed requests 3 times
      },
    },
  });
});

/**
 * Creates and configures a new QueryClient instance.
 * @returns A new QueryClient instance.
 */
export function makeQueryClient(): QueryClient {
  const client = getQueryClient();

  if (typeof window !== 'undefined') {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
    });

    void persistQueryClient({
      queryClient: client,
      persister,
      maxAge: 1_000 * 60 * 60 * 24, // 24 hours,
    });
  }

  return client;
}
