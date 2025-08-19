/**
 * Main ORPC Client Configuration
 *
 * This module exports the primary ORPC client used throughout the application.
 * It creates an isomorphic client that works both on the server and client side:
 * - Server-side: Uses direct router client with request headers from TanStack Start
 * - Client-side: Uses OpenAPI link with automatic cookie inclusion for authentication
 *
 * The client is integrated with TanStack Query for data fetching and caching.
 * @see {@link ./routes/contract} - Type-safe contract definitions
 * @see {@link ./routes/router} - Main router with all endpoints
 */

import { bigDecimalSerializer } from "@atk/zod/validators/bigdecimal";
import { bigIntSerializer } from "@atk/zod/validators/bigint";
import { timestampSerializer } from "@atk/zod/validators/timestamp";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import type { contract } from "@/orpc/routes/contract";
import { router } from "./routes/router";

const logger = createLogger();

/**
 * Creates an isomorphic ORPC client that adapts based on the runtime environment.
 *
 * Server-side behavior:
 * - Creates a direct router client for optimal performance
 * - Automatically includes request headers from TanStack Start
 * - Bypasses HTTP layer for direct function calls
 *
 * Client-side behavior:
 * - Creates an OpenAPI client that communicates via HTTP
 * - Automatically includes cookies for session-based authentication
 * - Points to the `/api` endpoint relative to the current origin
 */
const getORPCClient = createIsomorphicFn()
  .server(() => {
    return createRouterClient(router, {
      context: () => {
        try {
          const headers = getHeaders();
          return {
            headers,
          };
        } catch (error) {
          // Handle cases where there's no HTTP event in AsyncLocalStorage
          // This can happen during hydration or when there's no active request
          logger.warn(
            "No HTTPEvent found in AsyncLocalStorage, using empty headers",
            { error }
          );
          return {
            headers: {} as ReturnType<typeof getHeaders>,
          };
        }
      },
    });
  })
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: `${globalThis.location.origin}/api/rpc`,
      async fetch(url, options) {
        return await globalThis.fetch(url, {
          ...options,
          // Include cookies in all requests for authentication
          credentials: "include",
        });
      },
      customJsonSerializers: [
        bigDecimalSerializer,
        bigIntSerializer,
        timestampSerializer,
      ],
    });

    return createORPCClient(link);
  });

/**
 * The main ORPC client instance used throughout the application.
 *
 * This client is fully type-safe and provides access to all API endpoints
 * defined in the contract. It automatically handles JSON serialization
 * and deserialization for all requests and responses.
 * @example
 * ```typescript
 * // Fetch current user
 * const user = await client.user.me();
 *
 * // Track a transaction
 * const result = await client.transaction.track({
 *   operation: 'issue',
 *   assetId: '123',
 *   transactionId: 'abc'
 * });
 * ```
 */
export const client = getORPCClient() as ContractRouterClient<typeof contract>;

/**
 * TanStack Query utilities for the ORPC client.
 *
 * Provides React hooks and utilities for data fetching with:
 * - Automatic caching and background refetching
 * - Optimistic updates
 * - Request deduplication
 * - Error and loading states
 * @example
 * ```typescript
 * // In a React component
 * const { data, isLoading } = orpc.user.me.useQuery();
 *
 * // Prefetch data
 * await orpc.user.me.prefetch();
 * ```
 */
export const orpc = createTanstackQueryUtils(client);
