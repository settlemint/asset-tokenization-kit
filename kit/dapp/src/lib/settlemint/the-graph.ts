import { createTheGraphClient } from "@settlemint/sdk-thegraph";
import { createLogger, requestLogger, type LogLevel } from '@settlemint/sdk-utils/logging';
import type { introspection as kitIntrospection } from "@schemas/the-graph-env-kit"

const logger = createLogger({ level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel });

export const { client: theGraphClientKit, graphql: theGraphGraphqlKit } = createTheGraphClient<{
  introspection: kitIntrospection;
  disableMasking: true;
  // https://thegraph.com/docs/en/subgraphs/developing/creating/ql-schema/#built-in-scalar-types
  scalars: {
    Bytes: string;
    Int8: string;
    BigInt: string;
    BigDecimal: string;
    Timestamp: string;
  };
  }>({
  instances: JSON.parse(process.env.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS || '[]'),
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
  subgraphName: "kit",
  cache: "force-cache",
}, {
  fetch: requestLogger(logger, "the-graph-kit", fetch) as typeof fetch,
});

export const theGraphClient = theGraphClientKit;
export const theGraphGraphql = theGraphGraphqlKit;
