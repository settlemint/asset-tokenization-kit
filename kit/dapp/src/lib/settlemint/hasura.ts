import { createHasuraClient } from "@settlemint/sdk-hasura";
import type { introspection } from "@schemas/hasura-env";
import {
  createLogger,
  requestLogger,
  type LogLevel,
} from "@settlemint/sdk-utils/logging";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

export const { client: hasuraClient, graphql: hasuraGraphql } =
  createHasuraClient<{
    introspection: introspection;
    disableMasking: true;
    scalars: {
      timestamp: string;
      timestampz: string;
      uuid: string;
      date: string;
      time: string;
      jsonb: string;
      numeric: string;
      interval: string;
      geometry: string;
      geography: string;
    };
  }>(
    {
      instance: process.env.SETTLEMINT_HASURA_ENDPOINT!,
      accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
      adminSecret: process.env.SETTLEMINT_HASURA_ADMIN_SECRET!,
    },
    {
      fetch: requestLogger(logger, "hasura", fetch) as typeof fetch,
    }
  );
