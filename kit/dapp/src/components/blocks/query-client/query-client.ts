import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { cache } from 'react';

const getQueryClient = cache(
  () =>
    new QueryClient({
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
    })
);

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
