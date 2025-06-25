import type { router } from "@/orpc/routes/router";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

export type OrpcClient = RouterClient<typeof router>;

export const getOrpcClient = (headers: Headers) => {
  const link = new RPCLink({
    url: "http://localhost:3000/api/rpc",
    headers: () => ({
      cookie: headers.get("Cookie") as string,
    }),
    // fetch: <-- provide fetch polyfill fetch if needed
  });
  return createORPCClient(link) as RouterClient<typeof router>;
};
