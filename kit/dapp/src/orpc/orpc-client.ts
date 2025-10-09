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

import { normalizeHeaders } from "@/orpc/context/context";
import { bigDecimalSerializer } from "@atk/zod/bigdecimal";
import { bigIntSerializer } from "@atk/zod/bigint";
import { timestampSerializer } from "@atk/zod/timestamp";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import type { router } from "./routes/router";

const logger = createLogger();

// Prevent errors of libraries that try to stringify BigInt values
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
declare global {
  interface BigInt {
    toJSON: () => string;
  }
}
BigInt.prototype.toJSON = function () {
  return this.toString();
};

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
  .server((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: `http://localhost:3000/api/rpc`,
      headers: () => {
        try {
          const headers = getHeaders();
          return normalizeHeaders(headers);
        } catch (error) {
          // Handle cases where there's no HTTP event in AsyncLocalStorage
          // This can happen during hydration or when there's no active request
          logger.warn(
            "No HTTPEvent found in AsyncLocalStorage, using empty headers",
            { error }
          );
          return {};
        }
      },
      customJsonSerializers: [
        bigDecimalSerializer,
        bigIntSerializer,
        timestampSerializer,
      ],
    });
    return createORPCClient(link);
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
