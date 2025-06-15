import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { contract } from "./routes/contract";
import { router } from "./routes/router";

const getORPCClient = createIsomorphicFn()
  .server(() => {
    return createRouterClient(router, {
      context: () => ({
        headers: getHeaders(),
      }),
    });
  })
  .client((): RouterClient<typeof router> => {
    const link = new OpenAPILink(contract, {
      url: `${window.location.origin}/api`,
      fetch(url, options) {
        return globalThis.fetch(url, {
          ...options,
          // Include cookies in all requests for authentication
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  });

export const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
  getORPCClient();

export const orpc = createTanstackQueryUtils(client);
