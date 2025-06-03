import { contract } from "@/lib/orpc/routes/contract";
import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

const link = new OpenAPILink(contract, {
  url: `${typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:3000"}/api`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
  createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
