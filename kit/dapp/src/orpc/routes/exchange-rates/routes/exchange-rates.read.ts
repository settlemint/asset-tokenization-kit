/**
 * Exchange Rates Read Route
 *
 * Retrieves the current exchange rate between two currencies.
 * Automatically triggers synchronization if no rates exist.
 * @module ExchangeRatesRead
 */
import { fxRatesLatest } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { publicRouter } from "@/orpc/procedures/public.router";
import { and, desc, eq, or } from "drizzle-orm";
import { syncExchangeRatesInternal } from "./exchange-rates.sync";

/**
 * Exchange rate read route handler.
 *
 * Retrieves the current exchange rate between two currencies.
 * If no rates exist in the database, automatically triggers a sync
 * with external providers before returning the rate.
 *
 * The handler checks for both direct rates (e.g., USD/EUR) and
 * inverse rates (e.g., EUR/USD) to maximize data availability.
 *
 * Authentication: Not required (public endpoint)
 * Method: GET /exchange-rates/:baseCurrency/:quoteCurrency
 * @param input - Currency pair to query
 * @param context - Request context with database connection
 * @returns Current exchange rate or null if not available
 */
export const read = publicRouter.exchangeRates.read
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { exchangeRates: ["read"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    const { baseCurrency, quoteCurrency } = input;

    // Handle same currency case
    if (baseCurrency === quoteCurrency) {
      return {
        baseCurrency,
        quoteCurrency,
        rate: 1,
        effectiveAt: new Date(),
      };
    }

    // Build query conditions
    // Direct rate condition
    const conditions = [
      and(
        eq(fxRatesLatest.baseCode, baseCurrency),
        eq(fxRatesLatest.quoteCode, quoteCurrency)
      ),
    ];

    // Query for the rate
    const [rate] = await context.db
      .select()
      .from(fxRatesLatest)
      .where(or(...conditions))
      .orderBy(desc(fxRatesLatest.effectiveAt))
      .limit(1);

    // If rate exists, return it
    if (rate) {
      const rateValue = Number.parseFloat(rate.rate);

      return {
        baseCurrency: rate.baseCode,
        quoteCurrency: rate.quoteCode,
        rate: rateValue,
        effectiveAt: rate.effectiveAt,
      };
    }

    // No rates found - check if we have any rates at all
    const rateCount = await context.db.select().from(fxRatesLatest).limit(1);

    if (rateCount.length === 0) {
      try {
        // Trigger sync using internal function
        await syncExchangeRatesInternal(context.db, true);

        // Try to get the rate again after sync
        const [syncedRate] = await context.db
          .select()
          .from(fxRatesLatest)
          .where(or(...conditions))
          .orderBy(desc(fxRatesLatest.effectiveAt))
          .limit(1);

        if (syncedRate) {
          const rateValue = Number.parseFloat(syncedRate.rate);

          return {
            baseCurrency: syncedRate.baseCode,
            quoteCurrency: syncedRate.quoteCode,
            rate: rateValue,
            effectiveAt: syncedRate.effectiveAt,
          };
        }
      } catch {
        // Sync failed, continue to return null
      }
    }

    // Check for inverse rate
    const [inverseRate] = await context.db
      .select()
      .from(fxRatesLatest)
      .where(
        and(
          eq(fxRatesLatest.baseCode, quoteCurrency),
          eq(fxRatesLatest.quoteCode, baseCurrency)
        )
      )
      .limit(1);

    if (inverseRate) {
      const inverseValue = Number.parseFloat(inverseRate.rate);
      const rateValue = 1 / inverseValue;

      return {
        baseCurrency,
        quoteCurrency,
        rate: rateValue,
        effectiveAt: inverseRate.effectiveAt,
      };
    }

    return null;
  });
