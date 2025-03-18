import { defaultErrorSchema } from "@/lib/api/default-error-schema";
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
        summary: "List",
        description:
          "Retrieves all exchange rates for a specific base currency.",
        tags: ["provider"],
      },
      response: {
        200: ExchangeRatesResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
