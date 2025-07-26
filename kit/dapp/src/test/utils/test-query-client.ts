import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a test query client with optimized settings for tests
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Turn off retries for tests
        retry: false,
        // Turn off refetch on window focus
        refetchOnWindowFocus: false,
        // Set stale time to 0 for tests
        staleTime: 0,
        // Disable garbage collection time for tests
        gcTime: 0,
      },
      mutations: {
        // Turn off retries for tests
        retry: false,
      },
    },
    // Silence errors in tests
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}
