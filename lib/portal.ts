import { createServerPortalClient } from "@settlemint/sdk-portal";
import type { introspection } from "./graphql/portal-env.d.ts";

export const { client: portalClient, graphql: portalGraphql } = createServerPortalClient<{
  introspection: introspection;
  disableMasking: true;
  scalars: {
    DateTime: Date;
    JSON: Record<string, unknown>;
  };
}>({
  instance: process.env.SETTLEMINT_HASURA_ENDPOINT!,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN!,
});
