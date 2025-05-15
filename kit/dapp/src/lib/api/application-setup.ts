import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { ApplicationSetupStatusSchema } from "@/lib/queries/application-setup/application-setup-schema";
import {
  getApplicationSetupStatus,
  subscribeToApplicationSetupStatus,
} from "@/lib/queries/application-setup/application-setup-status";
import { tryParseJson } from "@settlemint/sdk-utils";
import { Elysia, t } from "elysia";
import type { ElysiaWS } from "elysia/ws";
import { createClient, type Client } from "graphql-ws";
import { logger } from "./utils/api-logger";

const portalWsConnections = new Map<string, { client: Client; ws: ElysiaWS }>();

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
      const connection = portalWsConnections.get(ws.id);
      if (connection) {
        connection.client.terminate();
        connection.client.dispose();
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
        const accessToken = process.env.SETTLEMINT_ACCESS_TOKEN;
        const client = createClient({
          url: `${graphqlEndpoint.protocol}//${graphqlEndpoint.host}/${accessToken}${graphqlEndpoint.pathname}${graphqlEndpoint.search}`,
        });
        portalWsConnections.set(ws.id, { client, ws });

        subscribeToApplicationSetupStatus(client, (status) => {
          ws.send(makeJsonStringifiable(status));
        }).catch((event: CloseEvent) => {
          if (event instanceof Error) {
            logger.error(
              "Error subscribing to application setup status",
              event
            );
            ws.send({ error: event.message ?? "unknown error" });
            return;
          }
          if (event.type === "close") {
            ws.close(1000, "Websocket closed (connection timeout)");
            return;
          }
          logger.error("Error subscribing to application setup status", event);
          ws.send({ error: `${event.code} ${event.reason}` });
        });
      } catch (err) {
        const error = err as Error;
        logger.error("Error processing websocket message", error);
        ws.send({ error: error.message ?? "unknown error" });
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
