import { contract } from "@/lib/orpc/routes/contract";
import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

/**
 * OpenAPI link configuration for ORPC client communication.
 *
 * This link handles the HTTP transport layer between the client and server,
 * providing automatic request/response handling, authentication headers,
 * and environment-aware URL resolution.
 */
const link = new OpenAPILink(contract, {
  // Dynamically determine the API base URL based on environment
  // - Browser: Use current origin to avoid CORS issues
  // - Server: Use localhost for SSR/build-time requests
  url: `${typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:3000/api"}`,

  /**
   * Dynamic header injection for authentication and request context.
   *
   * This function is called for every request to inject necessary headers.
   * It checks for a global $headers function (typically set by middleware)
   * to provide authentication tokens, CSRF tokens, or other request metadata.
   */
  headers: async () => {
    return (globalThis as unknown as { $headers: () => Promise<Headers> })
      .$headers
      ? // SSR context: Use global headers function set by server middleware
        Object.fromEntries(
          await (
            globalThis as unknown as { $headers: () => Promise<Headers> }
          ).$headers()
        )
      : // Browser context: No additional headers needed (cookies handle auth)
        {};
  },

  /**
   * Custom fetch implementation with credential handling.
   *
   * Overrides the default fetch to ensure cookies are included in all requests,
   * which is essential for session-based authentication and CSRF protection.
   *
   * @param url - The request URL
   * @param options - Fetch options
   * @returns Promise resolving to the fetch response
   */
  fetch(url, options) {
    return globalThis.fetch(url, {
      ...options,
      // Include cookies in all requests for authentication
      credentials: "include",
    });
  },
});

/**
 * Type-safe ORPC client instance.
 *
 * This client provides full TypeScript support for all API routes defined in the contract,
 * enabling compile-time validation of request/response types and automatic code completion.
 * The JsonifiedClient wrapper ensures proper serialization of complex types like Dates and BigInts.
 */
const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
  createORPCClient(link);

/**
 * TanStack Query utilities for ORPC operations.
 *
 * This export provides React Query hooks and utilities that integrate seamlessly
 * with the ORPC client, offering:
 *
 * - Automatic query key generation based on procedure names and parameters
 * - Type-safe query and mutation hooks
 * - Built-in caching, background refetching, and error handling
 * - Optimistic updates and cache invalidation utilities
 */
export const orpc = createTanstackQueryUtils(client);
