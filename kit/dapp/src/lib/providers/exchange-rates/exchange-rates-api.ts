import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { getAllExchangeRates } from "./exchange-rates";

const ExchangeRateSchema = t.Object({
  id: t.String({
    description: "Unique identifier for the exchange rate record",
  }),
  baseCurrency: t.String({
    description: "The base currency code (e.g., USD)",
  }),
  quoteCurrency: t.String({
    description: "The quote currency code (e.g., EUR)",
  }),
  rate: t.String({
    description: "The exchange rate value",
  }),
  lastUpdated: t.Date({
    description: "Timestamp of the last update",
  }),
});

const ExchangeRatesResponseSchema = t.Array(ExchangeRateSchema);

export const ExchangeRatesApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      const rates = await getAllExchangeRates();
      return rates || [];
    },
    {
      auth: true,
      detail: {
        summary: "Get Exchange Rates",
        description: "Retrieves all current exchange rates from the database.",
        tags: ["Providers"],
      },
      response: {
        200: ExchangeRatesResponseSchema,
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
        404: t.Object({
          error: t.String({
            description: "Not Found - The requested resource does not exist",
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
