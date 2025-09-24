/**
 * Main ORPC Client Configuration
 *
 * This module exports the primary ORPC client used throughout the application.
 * It creates an isomorphic client that works both on the server and client side:
 * - Server-side: Uses pre-initialized globalThis.$client for optimal SSR performance
 * - Client-side: Uses OpenAPI link with automatic cookie inclusion for authentication
 *
 * The server-side client is initialized in @/lib/orpc.server
 * to ensure zero client bundle impact while providing optimal SSR performance.
 *
 * The client is integrated with TanStack Query for data fetching and caching.
 * @see {@link ./routes/contract} - Type-safe contract definitions
 * @see {@link ./routes/router} - Main router with all endpoints
 * @see {@link @/lib/orpc.server} - Server-side client initialization
 */

import { bigDecimalSerializer } from "@atk/zod/bigdecimal";
import { bigIntSerializer } from "@atk/zod/bigint";
import { timestampSerializer } from "@atk/zod/timestamp";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import type { router } from "./routes/router";

/**
 * Creates an isomorphic ORPC client that adapts based on the runtime environment.
 *
 * Server-side behavior:
 * - Uses pre-initialized globalThis.$client from @/lib/orpc.server
 * - Provides zero-latency direct function calls during SSR
 * - Eliminates async imports and HTTP overhead
 *
 * Client-side behavior:
 * - Creates an OpenAPI client that communicates via HTTP
 * - Automatically includes cookies for session-based authentication
 * - Points to the `/api` endpoint relative to the current origin
 * - Router code is completely excluded from client bundle
 */
const getORPCClient = createIsomorphicFn()
  .server(() => {
    // Use the pre-initialized server client from @/lib/orpc.server
    if (!globalThis.$client) {
      throw new Error(
        "Server ORPC client not initialized. Ensure @/lib/orpc.server is imported before this module."
      );
    }
    return globalThis.$client;
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

export const client = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
