import { bigDecimalSerializer } from "@atk/zod/validators/bigdecimal";
import { bigIntSerializer } from "@atk/zod/validators/bigint";
import { timestampSerializer } from "@atk/zod/validators/timestamp";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { router } from "@/routes/router";

export type OrpcClient = RouterClient<typeof router>;

export const getTestOrpcClient = (headers: Headers): RouterClient<typeof router> => {
  const link = new RPCLink({
    url: "http://localhost:3000/api/rpc",
    headers: () => ({
      cookie: headers.get("Cookie") as string,
    }),
    customJsonSerializers: [bigDecimalSerializer, bigIntSerializer, timestampSerializer],
  });
  return createORPCClient(link);
};
