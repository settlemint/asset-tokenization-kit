// import type { introspection } from "@schemas/hasura-env";
import { createHasuraClient } from "@settlemint/sdk-hasura";

type introspection = {
  name: "hasura";
  query: "query_root";
  mutation: "mutation_root";
  subscription: "subscription_root";
  types: Record<string, unknown>;
};

export const { client: hasuraClient, graphql: hasuraGraphql } = createHasuraClient<{
  introspection: introspection;
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
  instance: process.env.SETTLEMINT_HASURA_ENDPOINT!,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN!, // undefined in browser, by design to not leak the secrets
  adminSecret: process.env.SETTLEMINT_HASURA_ADMIN_SECRET!, // undefined in browser, by design to not leak the secrets
});
