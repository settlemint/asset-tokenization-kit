import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: true,
          refetchIntervalInBackground: false,
          networkMode: 'online',
          staleTime: 1000 * 60, // Consider data stale after 1 minute
          retry: 3, // Retry failed requests 3 times
        },
      },
    })
);
