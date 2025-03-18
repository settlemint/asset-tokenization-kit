import { FiatCurrencies } from "@/lib/db/schema-settings";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { getExchangeRatesForBase } from "./exchange-rates";

const FiatCurrencyEnum = Object.fromEntries(
  FiatCurrencies.map((currency) => [currency, currency])
);

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
});

const ExchangeRatesResponseSchema = t.Array(ExchangeRateSchema);

export const ExchangeRatesApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/:base",
    async ({ params: { base } }) => {
      const rates = await getExchangeRatesForBase(base);
      if (!rates || rates.length === 0) {
        throw new Error(`No exchange rates found for base currency: ${base}`);
      }
      return rates;
    },
    {
      auth: true,
      params: t.Object({
        base: t.Enum(FiatCurrencyEnum, {
          description: "The base currency code (e.g., USD)",
        }),
      }),
      detail: {
        summary: "Get Exchange Rates for Base Currency",
        description:
          "Retrieves all exchange rates for a specific base currency.",
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
