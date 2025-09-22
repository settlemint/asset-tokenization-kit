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

import type { contract } from "@/orpc/routes/contract";
import { bigDecimalSerializer } from "@atk/zod/bigdecimal";
import { bigIntSerializer } from "@atk/zod/bigint";
import { timestampSerializer } from "@atk/zod/timestamp";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import type { router as AppRouter } from "./routes/router";

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
  .server(async () => {
    const { router } = await import("./routes/router");
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
  .client((): RouterClient<typeof AppRouter> => {
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

type OrpcUtils = ReturnType<
  typeof createTanstackQueryUtils<ContractRouterClient<typeof contract>>
>;

let cachedClient: ContractRouterClient<typeof contract> | undefined;
let cachedOrpc: OrpcUtils | undefined;

function ensureClient(): ContractRouterClient<typeof contract> {
  if (!cachedClient) {
    const instance = getORPCClient();

    if (!instance) {
      throw new Error(
        "ORPC client is unavailable. Ensure TanStack Start has initialised before accessing the ORPC client."
      );
    }

    if (instance instanceof Promise) {
      throw new TypeError(
        "ORPC client returned a Promise. This usually means the ORPC client was accessed before the TanStack Start transformer executed."
      );
    }

    cachedClient = instance as ContractRouterClient<typeof contract>;
  }

  return cachedClient;
}

function ensureOrpc(): OrpcUtils {
  if (!cachedOrpc) {
    cachedOrpc = createTanstackQueryUtils(ensureClient());
  }

  return cachedOrpc;
}

function bindValue(source: object, prop: PropertyKey) {
  const value = Reflect.get(source, prop);
  return typeof value === "function" ? value.bind(source) : value;
}

/**
 * The main ORPC client instance used throughout the application.
 *
 * Turbo prebuild imports this module before TanStack rewrites `createIsomorphicFn`.
 * The proxy delays instantiation until a property is actually read, so the rewrite
 * finishes first and we avoid the previous "undefined" client.
 */
export const client = new Proxy({} as ContractRouterClient<typeof contract>, {
  get(_target, prop) {
    if (prop === "__isProxy") return true;
    const instance = ensureClient();
    return bindValue(instance, prop);
  },
  has(_target, prop) {
    const instance = ensureClient();
    return prop in instance;
  },
  getOwnPropertyDescriptor(_target, prop) {
    const instance = ensureClient();
    return Object.getOwnPropertyDescriptor(instance, prop);
  },
  ownKeys() {
    return Reflect.ownKeys(ensureClient() as unknown as object);
  },
  getPrototypeOf() {
    return Reflect.getPrototypeOf(ensureClient());
  },
  setPrototypeOf(_target, prototype) {
    return Reflect.setPrototypeOf(ensureClient(), prototype);
  },
  defineProperty(_target, prop, descriptor) {
    return Reflect.defineProperty(ensureClient(), prop, descriptor);
  },
  deleteProperty(_target, prop) {
    return Reflect.deleteProperty(ensureClient(), prop);
  },
});

/**
 * TanStack Query utilities for the ORPC client.
 *
 * Provides React hooks and utilities for data fetching and caching.
 */
export const orpc = new Proxy({} as OrpcUtils, {
  get(_target, prop) {
    if (prop === "__isProxy") return true;
    const instance = ensureOrpc();
    return bindValue(instance, prop);
  },
  has(_target, prop) {
    const instance = ensureOrpc();
    return prop in instance;
  },
  getOwnPropertyDescriptor(_target, prop) {
    const instance = ensureOrpc();
    return Object.getOwnPropertyDescriptor(instance, prop);
  },
  ownKeys() {
    return Reflect.ownKeys(ensureOrpc() as unknown as object);
  },
  getPrototypeOf() {
    return Reflect.getPrototypeOf(ensureOrpc());
  },
  setPrototypeOf(_target, prototype) {
    return Reflect.setPrototypeOf(ensureOrpc(), prototype);
  },
  defineProperty(_target, prop, descriptor) {
    return Reflect.defineProperty(ensureOrpc(), prop, descriptor);
  },
  deleteProperty(_target, prop) {
    return Reflect.deleteProperty(ensureOrpc(), prop);
  },
});
