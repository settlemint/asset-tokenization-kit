import { createTheGraphClient } from "@settlemint/sdk-thegraph";
import type { introspection as starterkitsIntrospection } from "@schemas/the-graph-env-starterkits"

export const { client: theGraphClient, graphql: theGraphGraphql } = createTheGraphClient<{
  introspection: starterkitsIntrospection;
  disableMasking: true;
  scalars: {
    DateTime: Date;
    JSON: Record<string, unknown>;
    Bytes: string;
    Int8: string;
    BigInt: string;
    BigDecimal: string;
    Timestamp: string;
  };
  }>({
  instances: process.env.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS!,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN!, // undefined in browser, by design to not leak the secrets
  subgraphName: "starterkits",
});