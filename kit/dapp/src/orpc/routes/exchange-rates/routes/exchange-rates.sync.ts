/**
 * Exchange Rates Sync Route
 *
 * Synchronizes exchange rates with external providers.
 * @module ExchangeRatesSync
 */

import type * as schema from "@/lib/db/schema";
import {
  currencies,
  currencyDataSchema,
  fxRateDataSchema,
  fxRateLatestDataSchema,
  fxRates,
  fxRatesLatest,
} from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { fiatCurrencies, fiatCurrencyMetadata } from "@atk/zod/fiat-currency";
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { exchangeRateApiResponseSchema } from "../schemas";

/**
 * Fetches exchange rates from the ExchangeRate-API.
 */
async function fetchExchangeRatesFromApi(
  baseCurrency: string
): Promise<Record<string, number>> {
  const response = await fetch(
    `https://open.er-api.com/v6/latest/${baseCurrency}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch exchange rates: ${String(response.status)} ${response.statusText}`
    );
  }

  const data = (await response.json()) as unknown;

  // Validate the response with Zod schema
  const parsed = exchangeRateApiResponseSchema.parse(data);

  return parsed.rates;
}

/**
 * Calculates cross rates for all currency pairs.
 */
async function calculateCrossRates(): Promise<
  Map<string, { rate: number; effectiveAt: Date }>
> {
  const ratesMap = new Map<string, { rate: number; effectiveAt: Date }>();
  const effectiveAt = new Date();

  // Fetch USD rates as base currency
  const usdRates = await fetchExchangeRatesFromApi("USD");

  // Calculate cross rates for all currency pairs
  for (const baseCurrency of fiatCurrencies) {
    for (const quoteCurrency of fiatCurrencies) {
      if (baseCurrency === quoteCurrency) {
        continue;
      }

      // Convert through USD
      const baseRate = usdRates[baseCurrency];
      const quoteRate = usdRates[quoteCurrency];

      if (!baseRate || !quoteRate) {
        continue;
      }

      const baseToUSD = baseCurrency === "USD" ? 1 : 1 / baseRate;
      const usdToQuote = quoteCurrency === "USD" ? 1 : quoteRate;
      const crossRate = baseToUSD * usdToQuote;

      ratesMap.set(`${baseCurrency}-${quoteCurrency}`, {
        rate: crossRate,
        effectiveAt,
      });
    }
  }

  return ratesMap;
}

/**
 * Internal sync function that can be called without authentication.
 * Used by the public read route for auto-sync.
 */
export async function syncExchangeRatesInternal(
  db: NodePgDatabase<typeof schema>,
  force = false
): Promise<{
  success: boolean;
  ratesUpdated: number;
  syncedAt: Date;
  message?: string;
}> {
  const syncedAt = new Date();

  // Check if we have recent data (within last hour) unless force is true
  if (!force) {
    const recentRate = await db
      .select()
      .from(fxRatesLatest)
      .where(sql`${fxRatesLatest.effectiveAt} > NOW() - INTERVAL '1 hour'`)
      .limit(1);

    if (recentRate.length > 0 && recentRate[0]) {
      return {
        success: true,
        ratesUpdated: 0,
        syncedAt: recentRate[0].effectiveAt,
        message: "Recent rates already exist. Use force=true to update.",
      };
    }
  }

  // First, ensure all currencies exist in the database
  const currencyInserts = fiatCurrencies.map((code) => {
    const data = {
      code,
      name: fiatCurrencyMetadata[code].name,
      decimals: fiatCurrencyMetadata[code].decimals.toString(),
    };
    return currencyDataSchema.parse(data);
  });

  await db.insert(currencies).values(currencyInserts).onConflictDoNothing();

  // Calculate all cross rates
  const ratesMap = await calculateCrossRates();
  let ratesUpdated = 0;

  // Begin transaction for atomic updates
  await db.transaction(async (tx) => {
    // Insert rates into both tables
    for (const [pair, data] of ratesMap) {
      const [baseCurrency, quoteCurrency] = pair.split("-");
      const rateString = data.rate.toFixed(18);

      // Insert into time-series table
      const fxRateData = {
        baseCode: baseCurrency,
        quoteCode: quoteCurrency,
        provider: "er-api" as const,
        rate: rateString,
        effectiveAt: data.effectiveAt,
      };
      const validatedFxRateData = fxRateDataSchema.parse(fxRateData);

      await tx.insert(fxRates).values(validatedFxRateData);

      // Upsert into latest rates table
      const fxRateLatestData = {
        baseCode: baseCurrency,
        quoteCode: quoteCurrency,
        provider: "er-api" as const,
        rate: rateString,
        effectiveAt: data.effectiveAt,
      };
      const validatedFxRateLatestData =
        fxRateLatestDataSchema.parse(fxRateLatestData);

      await tx
        .insert(fxRatesLatest)
        .values(validatedFxRateLatestData)
        .onConflictDoUpdate({
          target: [
            fxRatesLatest.baseCode,
            fxRatesLatest.quoteCode,
            fxRatesLatest.provider,
          ],
          set: {
            rate: rateString,
            effectiveAt: data.effectiveAt,
            updatedAt: sql`NOW()`,
          },
        });

      ratesUpdated++;
    }
  });

  return {
    success: true,
    ratesUpdated,
    syncedAt,
  };
}

/**
 * Exchange rate sync route handler.
 *
 * Synchronizes exchange rates with external providers.
 * Requires authentication and appropriate permissions.
 *
 * Authentication: Required
 * Permissions: Requires admin or issuer role
 * Method: POST /exchange-rates/sync
 */
export const sync = authRouter.exchangeRates.sync
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { exchangeRates: ["sync"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    const { force } = input;
    const { db } = context;

    // Delegate to internal sync function
    const result = await syncExchangeRatesInternal(db, force);

    return result;
  });
