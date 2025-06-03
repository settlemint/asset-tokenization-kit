import { contract } from "@/lib/orpc/routes/contract";
import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const link = new OpenAPILink(contract, {
  url: `${typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:3000/api"}`,
  headers: async () => {
    return (globalThis as unknown as { $headers: () => Promise<Headers> })
      .$headers
      ? Object.fromEntries(
          await (
            globalThis as unknown as { $headers: () => Promise<Headers> }
          ).$headers()
        ) // use this on ssr
      : {}; // use this on browser
  },

  fetch(url, options) {
    return globalThis.fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
  createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
