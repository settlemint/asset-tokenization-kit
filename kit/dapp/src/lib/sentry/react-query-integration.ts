import * as Sentry from "@sentry/nextjs";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Integrates React Query with Sentry for enhanced error tracking and performance monitoring.
 *
 * This integration:
 * - Captures query and mutation errors with full context
 * - Creates breadcrumbs for query lifecycle events
 * - Tracks query performance with transactions
 * - Provides detailed error context including query keys and variables
 */
export function setupReactQueryErrorHandling(queryClient: QueryClient) {
  // Only set up if Sentry is initialized
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    return;
  }

  // Set up query cache event listeners for additional tracking
  const queryCache = queryClient.getQueryCache();
  const mutationCache = queryClient.getMutationCache();

  // Subscribe to query cache events
  const unsubscribeQuery = queryCache.subscribe((event) => {
    if (!event?.query) return;

    const { query } = event;

    if (event.type === "observerResultsUpdated" && query.state.error) {
      // Query failed
      Sentry.addBreadcrumb({
        category: "react-query",
        message: `Query failed: ${JSON.stringify(query.queryKey)}`,
        level: "error",
        data: {
          queryKey: query.queryKey,
          queryHash: query.queryHash,
          error:
            query.state.error instanceof Error
              ? query.state.error.message
              : String(query.state.error),
        },
      });

      // Capture the error with context
      Sentry.captureException(query.state.error, {
        contexts: {
          reactQuery: {
            type: "query",
            queryKey: query.queryKey,
            queryHash: query.queryHash,
            state: query.state.status,
          },
        },
        tags: {
          "react-query.type": "query",
          "react-query.status": "error",
        },
      });
    } else if (
      event.type === "observerResultsUpdated" &&
      query.state.data !== undefined
    ) {
      // Query succeeded
      Sentry.addBreadcrumb({
        category: "react-query",
        message: `Query succeeded: ${JSON.stringify(query.queryKey)}`,
        level: "info",
        data: {
          queryKey: query.queryKey,
          queryHash: query.queryHash,
        },
      });
    } else if (event.type === "added") {
      Sentry.addBreadcrumb({
        category: "react-query.cache",
        message: `Query added to cache: ${JSON.stringify(query.queryKey)}`,
        level: "debug",
      });
    } else if (event.type === "removed") {
      Sentry.addBreadcrumb({
        category: "react-query.cache",
        message: `Query removed from cache: ${JSON.stringify(query.queryKey)}`,
        level: "debug",
      });
    }
  });

  // Subscribe to mutation cache events
  const unsubscribeMutation = mutationCache.subscribe((event) => {
    if (!event?.mutation) return;

    const { mutation } = event;

    if (event.type === "updated" && mutation.state.error) {
      // Mutation failed
      Sentry.addBreadcrumb({
        category: "react-query",
        message: `Mutation failed: ${mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : "unknown"}`,
        level: "error",
        data: {
          mutationKey: mutation.options.mutationKey,
          error:
            mutation.state.error instanceof Error
              ? mutation.state.error.message
              : String(mutation.state.error),
        },
      });

      // Capture the error with context
      Sentry.captureException(mutation.state.error, {
        contexts: {
          reactQuery: {
            type: "mutation",
            mutationKey: mutation.options.mutationKey,
            state: mutation.state.status,
          },
        },
        tags: {
          "react-query.type": "mutation",
          "react-query.status": "error",
        },
      });
    } else if (event.type === "updated" && mutation.state.data !== undefined) {
      // Mutation succeeded
      Sentry.addBreadcrumb({
        category: "react-query",
        message: `Mutation succeeded: ${mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : "unknown"}`,
        level: "info",
        data: {
          mutationKey: mutation.options.mutationKey,
        },
      });
    } else if (event.type === "added") {
      Sentry.addBreadcrumb({
        category: "react-query.cache",
        message: `Mutation added to cache`,
        level: "debug",
      });
    } else if (event.type === "removed") {
      Sentry.addBreadcrumb({
        category: "react-query.cache",
        message: `Mutation removed from cache`,
        level: "debug",
      });
    }
  });

  // Return cleanup function
  return () => {
    unsubscribeQuery();
    unsubscribeMutation();
  };
}

/**
 * Creates a Sentry transaction for a React Query operation.
 * Use this for tracking performance of specific queries or mutations.
 */
export function withQueryTransaction<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startInactiveSpan({
    name,
    op: "react-query",
  });

  return operation()
    .then((result) => {
      transaction.setStatus({ code: 1, message: "ok" });
      return result;
    })
    .catch((error) => {
      transaction.setStatus({ code: 2, message: "internal_error" });
      throw error;
    })
    .finally(() => {
      transaction.end();
    });
}
