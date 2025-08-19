import type { introspection } from "@schemas/hasura-env";
import { createHasuraClient, createHasuraMetadataClient } from "@settlemint/sdk-hasura";
import { createLogger, type LogLevel, requestLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger({ level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel });

// Validate required environment variables
const hasuraEndpoint = process.env.SETTLEMINT_HASURA_ENDPOINT;
const hasuraAdminSecret = process.env.SETTLEMINT_HASURA_ADMIN_SECRET;

if (!hasuraEndpoint) {
  throw new Error("SETTLEMINT_HASURA_ENDPOINT environment variable is required");
}

if (!hasuraAdminSecret) {
  throw new Error("SETTLEMINT_HASURA_ADMIN_SECRET environment variable is required");
}

export const { client: hasuraClient, graphql: hasuraGraphql } = createHasuraClient<{
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
    instance: hasuraEndpoint,
    accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
    adminSecret: hasuraAdminSecret,
  },
  {
    fetch: requestLogger(logger, "hasura", fetch) as typeof fetch,
  }
);

export const hasuraMetadataClient = createHasuraMetadataClient(
  {
    instance: hasuraEndpoint,
    accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
    adminSecret: hasuraAdminSecret,
  },
  logger
);
