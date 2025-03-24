import { db } from "@/lib/db";
import { exchangeRate } from "@/lib/db/schema-exchange-rates";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import { safeParse } from "@/lib/utils/typebox";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import { t } from "elysia/type-system";

const ExchangeRateAPIResponseSchema = t.Object({
  result: t.Literal("success"),
  provider: t.String(),
  documentation: t.String(),
  terms_of_use: t.String(),
  time_last_update_unix: t.Number(),
  time_last_update_utc: t.String(),
  time_next_update_unix: t.Number(),
  time_next_update_utc: t.String(),
  time_eol_unix: t.Number(),
  base_code: t.String(),
  rates: t.Record(t.String(), t.Number()),
});

/**
 * Gets the current date formatted as ISO string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

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

  const parsed = safeParse(ExchangeRateAPIResponseSchema, data);
  return parsed.rates;
}

/**
 * Calculate cross rates for all currency pairs
 */
async function calculateCrossRates(): Promise<Map<string, number>> {
  const ratesMap = new Map<string, number>();

  // Fetch USD rates as base currency
  const usdRates = await fetchExchangeRates("USD");

  // Calculate cross rates for all currency pairs
  for (const baseCurrency of fiatCurrencies) {
    for (const quoteCurrency of fiatCurrencies) {
      if (baseCurrency === quoteCurrency) {
        continue;
      }

      // Convert through USD
      const baseToUSD = baseCurrency === "USD" ? 1 : 1 / usdRates[baseCurrency];
      const usdToQuote = quoteCurrency === "USD" ? 1 : usdRates[quoteCurrency];
      const crossRate = baseToUSD * usdToQuote;

      ratesMap.set(`${baseCurrency}${quoteCurrency}`, crossRate);
    }
  }
  return ratesMap;
}

/**
 * Updates exchange rates for all currency pairs in the database
 */
export async function updateExchangeRates(today: string) {
  // Calculate all cross rates
  const ratesMap = await calculateCrossRates();

  // Update database
  for (const baseCurrency of fiatCurrencies) {
    for (const quoteCurrency of fiatCurrencies) {
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
          day: today,
        })
        .onConflictDoUpdate({
          target: exchangeRate.id,
          set: {
            rate: rate.toString(),
            day: today,
          },
        });
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
  if (baseCurrency === quoteCurrency) {
    return 1;
  }

  const today = getTodayDateString();

  // Try to get today's rate first
  const rate = await db.query.exchangeRate.findFirst({
    where: and(
      eq(exchangeRate.id, `${baseCurrency}-${quoteCurrency}`),
      eq(exchangeRate.day, today)
    ),
  });

  if (!rate) {
    // If no rate exists, update all exchange rates
    await updateExchangeRates(today);

    // Try to get the rate again after update
    const updatedRate = await db.query.exchangeRate.findFirst({
      where: and(
        eq(exchangeRate.id, `${baseCurrency}-${quoteCurrency}`),
        eq(exchangeRate.day, today)
      ),
    });

    return updatedRate ? Number.parseFloat(updatedRate.rate.toString()) : null;
  }

  return Number.parseFloat(rate.rate.toString());
}

/**
 * Gets all exchange rates for a specific base currency
 */
export async function getExchangeRatesForBase(baseCurrency: CurrencyCode) {
  const today = getTodayDateString();

  const rates = await db.query.exchangeRate.findMany({
    where: and(
      eq(exchangeRate.baseCurrency, baseCurrency),
      eq(exchangeRate.day, today)
    ),
    orderBy: (exchangeRate, { asc }) => [asc(exchangeRate.id)],
  });

  if (rates.length === 0) {
    // If no rates exist, update all exchange rates
    await updateExchangeRates(today);

    // Try to get the rates again after update
    return await db.query.exchangeRate.findMany({
      where: and(
        eq(exchangeRate.baseCurrency, baseCurrency),
        eq(exchangeRate.day, today)
      ),
      orderBy: (exchangeRate, { asc }) => [asc(exchangeRate.id)],
    });
  }

  return rates;
}
