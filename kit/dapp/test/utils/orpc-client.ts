import { bigDecimalSerializer } from "@/lib/zod/validators/bigdecimal";
import { bigIntSerializer } from "@/lib/zod/validators/bigint";
import { timestampSerializer } from "@/lib/zod/validators/timestamp";
import type { router } from "@/orpc/routes/router";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { getDappUrl } from "./dapp";

export type OrpcClient = RouterClient<typeof router>;

export const getOrpcClient = (
  headers: Headers
): RouterClient<typeof router> => {
  const link = new RPCLink({
    url: `${getDappUrl()}/api/rpc`,
    headers: () => ({
      cookie: headers.get("Cookie") as string,
    }),
    customJsonSerializers: [
      bigDecimalSerializer,
      bigIntSerializer,
      timestampSerializer,
    ],
    // fetch: <-- provide fetch polyfill fetch if needed
  });
  return createORPCClient(link);
};
