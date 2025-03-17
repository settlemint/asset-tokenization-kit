import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { updateExchangeRates } from "./exchange-rates";

const ExchangeRateUpdateResponseSchema = t.Object({
  success: t.Boolean({
    description: "Whether the update operation was successful",
  }),
  message: t.String({
    description: "A message describing the result of the operation",
  }),
  timestamp: t.String({
    description: "The timestamp when the update was completed",
  }),
});

export const ExchangeRateUpdateApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .patch(
    "/",
    async () => {
      try {
        await updateExchangeRates();
        return {
          success: true,
          message: "Exchange rates updated successfully",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          timestamp: new Date().toISOString(),
        };
      }
    },
    {
      auth: true,
      detail: {
        summary: "Update Exchange Rates",
        description:
          "Updates all exchange rates by fetching current data from Yahoo Finance.",
        tags: ["Providers"],
      },
      response: {
        200: ExchangeRateUpdateResponseSchema,
        400: t.Object({
          error: t.String({
            description: "Bad Request - Invalid parameters or request format",
          }),
          details: t.Optional(t.Array(t.String())),
        }),
        401: t.Object({
          error: t.String({
            description: "Unauthorized - Authentication is required",
          }),
        }),
        403: t.Object({
          error: t.String({
            description:
              "Forbidden - Insufficient permissions to access the resource",
          }),
        }),
        429: t.Object({
          error: t.String({
            description: "Too Many Requests - Rate limit exceeded",
          }),
          retryAfter: t.Optional(t.Number()),
        }),
        500: t.Object({
          error: t.String({
            description:
              "Internal Server Error - Something went wrong on the server",
          }),
          requestId: t.Optional(t.String()),
        }),
      },
    }
  );
