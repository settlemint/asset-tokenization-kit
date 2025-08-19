import { createPortalClient, getWebsocketClient } from "@settlemint/sdk-portal";
import type { introspection } from "@schemas/portal-env";
import { createLogger, requestLogger, type LogLevel } from '@settlemint/sdk-utils/logging';

const logger = createLogger({ level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel });

// Validate required environment variables
const portalGraphqlEndpoint = process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT;

if (!portalGraphqlEndpoint) {
  throw new Error('SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT environment variable is required');
}

export const { client: portalClient, graphql: portalGraphql } = createPortalClient<{
  introspection: introspection;
  disableMasking: true;
  scalars: {
    /** Used for metadata field */
    JSON: unknown;
  };
}>({
  instance: portalGraphqlEndpoint,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
}, {
  fetch: requestLogger(logger, "portal", fetch) as typeof fetch,
});

export const portalWebsocketClient = getWebsocketClient({
  portalGraphqlEndpoint: portalGraphqlEndpoint,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
});
