import { normalizeHeaders } from "@/orpc/context/context";
import { router } from "@/orpc/routes/router";
import { createRouterClient, RouterClient } from "@orpc/server";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

const logger = createLogger();

// Extend globalThis type to include our server client cache
declare global {
  var $client: RouterClient<typeof router> | undefined;
}

/**
 * Creates an ORPC client that works on the server side.
 * Server-side behavior:
 * - Provides zero-latency direct function calls during SSR
 * - Eliminates async imports and HTTP overhead
 */
const createORPCServerClient = createIsomorphicFn().server(() => {
  globalThis.$client = createRouterClient(router, {
    context: () => {
      try {
        const headers = getRequestHeaders();
        return {
          headers: normalizeHeaders(headers),
        };
      } catch (error) {
        // Handle cases where there's no HTTP event in AsyncLocalStorage
        // This can happen during hydration or when there's no active request
        logger.warn(
          "No HTTPEvent found in AsyncLocalStorage, using empty headers",
          { error }
        );
        return {
          headers: {},
        };
      }
    },
  });
});

createORPCServerClient();
