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

/**
 * Sanitizes a search term for safe use in database queries
 * @param search The raw search term
 * @returns The sanitized search term
 */
export function sanitizeSearchTerm(search: string): string {
  // Remove any non-alphanumeric characters except spaces and common symbols
  const cleaned = search
    .trim()
    // Allow letters, numbers, spaces, and common symbols
    .replace(/[^a-zA-Z0-9\s@._-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Escape special characters used in LIKE patterns
    .replace(/[%_]/g, '\\$&');

  return cleaned;
}
