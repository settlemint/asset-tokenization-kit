import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { ApplicationSetupStatusSchema } from "@/lib/queries/application-setup/application-setup-schema";
import {
  getApplicationSetupStatus,
  subscribeToApplicationSetupStatus,
} from "@/lib/queries/application-setup/application-setup-status";
import { tryParseJson } from "@settlemint/sdk-utils";
import { Elysia } from "elysia";
import { createClient, type Client } from "graphql-ws";
import { logger } from "./utils/api-logger";

export const ApplicationSetupApi = new Elysia({
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .get(
    "/status",
    async () => {
      return getApplicationSetupStatus();
    },
    {
      auth: true,
      detail: {
        summary: "Get application setup status",
        description: "Retrieves the status of the application setup.",
        tags: ["application-setup"],
      },
      response: {
        200: ApplicationSetupStatusSchema,
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/stream/status",
    async function* () {
      let client: Client | undefined;
      try {
        if (!process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT) {
          yield JSON.stringify({
            error: "Smart Contract Portal GraphQL endpoint is not set",
          });
          return;
        }

        const graphqlEndpoint = new URL(
          process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT
        );
        graphqlEndpoint.protocol =
          graphqlEndpoint.protocol === "http:" ? "ws:" : "wss:";
        const accessToken = process.env.SETTLEMINT_ACCESS_TOKEN;
        client = createClient({
          url: `${graphqlEndpoint.protocol}//${graphqlEndpoint.host}/${accessToken}${graphqlEndpoint.pathname}${graphqlEndpoint.search}`,
        });

        const subscription = subscribeToApplicationSetupStatus(client);
        logger.info(`Listening for application setup status updates`);
        for await (const status of subscription) {
          yield JSON.stringify(makeJsonStringifiable(status));
        }
      } catch (err) {
        if (err instanceof Error) {
          logger.error("Error subscribing to application setup status", err);
          yield JSON.stringify({ error: err.message ?? "unknown error" });
        }
        const closeEvent = err as CloseEvent;
        if (closeEvent.type === "close") {
          return;
        }
        yield JSON.stringify({ error: "Unknown error" });
      } finally {
        client?.terminate();
        client?.dispose();
        logger.info(`Stream closed`);
      }
    },
    {
      auth: true,
      detail: {
        summary: "Stream application setup status",
        description: "Streams the status of the application setup.",
        tags: ["application-setup"],
      },
    }
  );

function makeJsonStringifiable<T>(value: unknown): T {
  if (value === undefined || value === null) {
    return value as T;
  }
  return tryParseJson<T>(
    JSON.stringify(
      value,
      (_, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    )
  ) as T;
}
