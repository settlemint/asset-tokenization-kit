import { createPortalClient, getWebsocketClient } from "@settlemint/sdk-portal";
import type { introspection } from "@schemas/portal-env";
import { createLogger, requestLogger, type LogLevel } from '@settlemint/sdk-utils/logging';

const logger = createLogger({ level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel });

export const { client: portalClient, graphql: portalGraphql } = createPortalClient<{
  introspection: introspection;
  disableMasking: true;
  scalars: {
    /** Used for metadata field */
    JSON: unknown;
  };
}>({
  instance: process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT!,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
}, {
  fetch: requestLogger(logger, "portal", fetch) as typeof fetch,
});

export const getPortalWebsocketClient = getWebsocketClient({
  portalGraphqlEndpoint: process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT!,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
});
