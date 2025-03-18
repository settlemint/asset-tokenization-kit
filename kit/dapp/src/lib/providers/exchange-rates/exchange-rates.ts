import { db } from "@/lib/db";
import { exchangeRate } from "@/lib/db/schema-exchange-rates";
import { type CurrencyCode, FiatCurrencies } from "@/lib/db/schema-settings";
import { z } from "@/lib/utils/zod";
import { eq } from "drizzle-orm";

const ExchangeRateAPIResponseSchema = z.object({
  result: z.literal("success"),
  provider: z.string(),
  documentation: z.string(),
  terms_of_use: z.string(),
  time_last_update_unix: z.number(),
  time_last_update_utc: z.string(),
  time_next_update_unix: z.number(),
  time_next_update_utc: z.string(),
  time_eol_unix: z.number(),
  base_code: z.string(),
  rates: z.record(z.string(), z.number()),
});

/**
 * Fetches exchange rates from the ExchangeRate-API Open Access Endpoint
 */
async function fetchExchangeRates(
  baseCurrency: CurrencyCode
): Promise<Record<string, number>> {
  const response = await fetch(
    `https://open.er-api.com/v6/latest/${baseCurrency}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const parsed = ExchangeRateAPIResponseSchema.safeParse(data);

  if (!parsed.success) {
    console.error("API Response validation failed:", parsed.error);
    throw new Error("Invalid API response format");
  }

  return parsed.data.rates;
}

/**
 * Calculate cross rates for all currency pairs
 */
async function calculateCrossRates(): Promise<Map<string, number>> {
  const ratesMap = new Map<string, number>();
  const calculatedPairs = new Set<string>();

  // Fetch USD rates as base currency
  const usdRates = await fetchExchangeRates("USD");

  // Calculate cross rates for all currency pairs
  for (const baseCurrency of FiatCurrencies) {
    for (const quoteCurrency of FiatCurrencies) {
      if (baseCurrency === quoteCurrency) {
        continue;
      }

      // Convert through USD
      const baseToUSD = baseCurrency === "USD" ? 1 : 1 / usdRates[baseCurrency];
      const usdToQuote = quoteCurrency === "USD" ? 1 : usdRates[quoteCurrency];
      const crossRate = baseToUSD * usdToQuote;

      ratesMap.set(`${baseCurrency}${quoteCurrency}`, crossRate);
      calculatedPairs.add(`${baseCurrency}/${quoteCurrency}`);
    }
  }
  return ratesMap;
}

/**
 * Updates exchange rates for all currency pairs in the database
 */
export async function updateExchangeRates() {
  // Calculate all cross rates
  const ratesMap = await calculateCrossRates();
  const updatedPairs = new Set<string>();

  // Update database
  for (const baseCurrency of FiatCurrencies) {
    for (const quoteCurrency of FiatCurrencies) {
      if (baseCurrency === quoteCurrency) continue;

      const rate = ratesMap.get(`${baseCurrency}${quoteCurrency}`);
      if (!rate) {
        continue;
      }

      const pairId = `${baseCurrency}-${quoteCurrency}`;

      // Insert or update rate
      await db
        .insert(exchangeRate)
        .values({
          id: pairId,
          baseCurrency,
          quoteCurrency,
          rate: rate.toString(),
        })
        .onConflictDoUpdate({
          target: exchangeRate.id,
          set: {
            rate: rate.toString(),
          },
        });

      updatedPairs.add(pairId);
    }
  }
}

/**
 * Gets the current exchange rate for a currency pair
 */
export async function getExchangeRate(
  baseCurrency: CurrencyCode,
  quoteCurrency: CurrencyCode
): Promise<number | null> {
  const rate = await db.query.exchangeRate.findFirst({
    where: eq(exchangeRate.id, `${baseCurrency}-${quoteCurrency}`),
  });

  if (!rate) {
    // If no rate exists, update all exchange rates
    await updateExchangeRates();

    // Try to get the rate again after update
    const updatedRate = await db.query.exchangeRate.findFirst({
      where: eq(exchangeRate.id, `${baseCurrency}-${quoteCurrency}`),
    });

    return updatedRate ? Number.parseFloat(updatedRate.rate.toString()) : null;
  }

  return Number.parseFloat(rate.rate.toString());
}

/**
 * Gets all exchange rates for a specific base currency
 */
export async function getExchangeRatesForBase(baseCurrency: CurrencyCode) {
  const rates = await db.query.exchangeRate.findMany({
    where: eq(exchangeRate.baseCurrency, baseCurrency),
    orderBy: (exchangeRate, { asc }) => [asc(exchangeRate.id)],
  });

  if (rates.length === 0) {
    // If no rates exist, update all exchange rates
    await updateExchangeRates();

    // Try to get the rates again after update
    return await db.query.exchangeRate.findMany({
      where: eq(exchangeRate.baseCurrency, baseCurrency),
      orderBy: (exchangeRate, { asc }) => [asc(exchangeRate.id)],
    });
  }

  return rates;
}
