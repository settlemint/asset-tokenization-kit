import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { ApplicationSetupStatusSchema } from "@/lib/queries/application-setup/application-setup-schema";
import {
  getApplicationSetupStatus,
  subscribeToApplicationSetupStatus,
} from "@/lib/queries/application-setup/application-setup-status";
import { tryParseJson } from "@settlemint/sdk-utils";
import { Elysia, t } from "elysia";
import { BunAdapter } from "elysia/adapter/bun";
import { createClient, type Client } from "graphql-ws";
import { logger } from "./utils/api-logger";

const portalWsConnections = new Map<string, Client>();

export const ApplicationSetupApi = new Elysia({
  adapter: typeof Bun !== "undefined" ? BunAdapter : undefined, // TODO: use node adapter (when compatible with elysiajs v1.3)
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
      debugger;
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
  .ws("/ws/status", {
    response: t.Union([
      ApplicationSetupStatusSchema,
      t.Object({ error: t.String() }),
    ]),
    error: (error) => {
      logger.error("Websocket error occurred", error);
    },
    close: (ws, code, reason) => {
      logger.info(`Websocket closed: ${code} ${reason}`);
      const client = portalWsConnections.get(ws.id);
      if (client) {
        client.terminate();
        client.dispose();
        portalWsConnections.delete(ws.id);
      }
    },
    open: (ws) => {
      logger.info(`Websocket opened: ${ws.id}`);
      try {
        // TODO: security check
        logger.info(`Websocket message received`);
        if (!process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT) {
          ws.send({
            error: "Smart Contract Portal GraphQL endpoint is not set",
          });
          return;
        }

        const graphqlEndpoint = new URL(
          process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT
        );
        graphqlEndpoint.protocol =
          graphqlEndpoint.protocol === "http:" ? "ws:" : "wss:";
        const client = createClient({
          url: graphqlEndpoint.toString(),
        });
        portalWsConnections.set(ws.id, client);
        subscribeToApplicationSetupStatus(client, (status) => {
          ws.send(makeJsonStringifiable(status));
        }).catch((error: Error) => {
          logger.error("Error subscribing to application setup status", error);
          ws.send({ error: error.message });
        });
      } catch (err) {
        const error = err as Error;
        logger.error("Error processing websocket message", error);
        ws.send({ error: error.message });
      }
    },
  });

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
