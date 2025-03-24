import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { Elysia, t } from "elysia";
import { getExchangeRatesForBase } from "./exchange-rates";

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
        base: t.UnionEnum(fiatCurrencies, {
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
