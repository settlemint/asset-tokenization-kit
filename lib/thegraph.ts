import { createServerTheGraphClient } from "@settlemint/sdk-thegraph";
import type { introspection } from "./graphql/thegraph-env.d.ts";

export const { client: thegraphClient, graphql: thegraphGraphql } = createServerTheGraphClient<{
  introspection: introspection;
  disableMasking: true;
  scalars: {
    DateTime: Date;
    JSON: Record<string, unknown>;
  };
}>({
  instance: process.env.SETTLEMINT_THEGRAPH_SUBGRAPH_ENDPOINT_FALLBACK!,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN!,
});
