/**
 * Exchange Rates History Route
 *
 * Retrieves historical exchange rates for a currency pair.
 * @module ExchangeRatesHistory
 */
import { fxRates } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { publicRouter } from "@/orpc/procedures/public.router";
import { and, between, desc, eq, gte, lte } from "drizzle-orm";

/**
 * Exchange rate history route handler.
 *
 * Retrieves historical exchange rates for a specific currency pair.
 * Useful for:
 * - Creating charts and visualizations
 * - Analyzing rate trends
 * - Backtesting and reconciliation
 *
 * Results are ordered by effective date (newest first) and limited
 * to prevent excessive data transfer.
 *
 * Authentication: Not required (public endpoint)
 * Method: GET /exchange-rates/:baseCurrency/:quoteCurrency/history
 * @param input - History query parameters
 * @param context - Request context with database connection
 * @returns Array of historical rates
 */
export const history = publicRouter.exchangeRates.history
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { exchangeRates: ["list"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    const {
      baseCurrency,
      quoteCurrency,
      startDate,
      endDate,
      limit = 100,
    } = input;

    // Build filter conditions
    const conditions = [
      eq(fxRates.baseCode, baseCurrency),
      eq(fxRates.quoteCode, quoteCurrency),
    ];

    if (startDate && endDate) {
      conditions.push(between(fxRates.effectiveAt, startDate, endDate));
    } else if (startDate) {
      conditions.push(gte(fxRates.effectiveAt, startDate));
    } else if (endDate) {
      conditions.push(lte(fxRates.effectiveAt, endDate));
    }

    // Query historical rates
    const rates = await context.db
      .select({
        baseCurrency: fxRates.baseCode,
        quoteCurrency: fxRates.quoteCode,
        rate: fxRates.rate,
        effectiveAt: fxRates.effectiveAt,
      })
      .from(fxRates)
      .where(and(...conditions))
      .orderBy(desc(fxRates.effectiveAt))
      .limit(limit);

    // Convert rates to numbers
    return rates.map((rate) => ({
      baseCurrency: rate.baseCurrency,
      quoteCurrency: rate.quoteCurrency,
      rate: Number.parseFloat(rate.rate),
      effectiveAt: rate.effectiveAt,
    }));
  });
