/**
 * Exchange Rates List Route
 *
 * Lists all available exchange rates with pagination and filtering.
 * @module ExchangeRatesList
 */
import { fxRatesLatest } from "@/lib/db/schema";
import { type FiatCurrency } from "@/lib/zod/validators/fiat-currency";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { publicRouter } from "@/orpc/procedures/public.router";
import { and, count, eq, sql } from "drizzle-orm";

/**
 * Exchange rates list route handler.
 *
 * Retrieves a paginated list of current exchange rates.
 * Supports filtering by base currency, quote currency, and provider.
 *
 * Authentication: Not required (public endpoint)
 * Method: GET /exchange-rates
 * @param input - List parameters including pagination and filters
 * @param context - Request context with database connection
 * @returns Paginated list of exchange rates
 */
export const list = publicRouter.exchangeRates.list
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { exchangeRates: ["list"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context }) => {
    const {
      offset = 0,
      limit,
      baseCurrency,
      quoteCurrency,
      orderBy = "id",
      orderDirection = "asc",
    } = input;

    // Build filter conditions
    const conditions = [];
    if (baseCurrency) {
      conditions.push(eq(fxRatesLatest.baseCode, baseCurrency));
    }
    if (quoteCurrency) {
      conditions.push(eq(fxRatesLatest.quoteCode, quoteCurrency));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await context.db
      .select({ total: count() })
      .from(fxRatesLatest)
      .where(whereClause);

    const total = countResult?.total ?? 0;

    // Map orderBy field to actual column
    const orderColumn =
      {
        id: fxRatesLatest.baseCode, // Default to baseCode for id
        baseCode: fxRatesLatest.baseCode,
        quoteCode: fxRatesLatest.quoteCode,
        rate: fxRatesLatest.rate,
        effectiveAt: fxRatesLatest.effectiveAt,
        updatedAt: fxRatesLatest.updatedAt,
      }[orderBy] ?? fxRatesLatest.baseCode;

    // Get paginated results
    const orderSql =
      orderDirection === "desc"
        ? sql`${orderColumn} DESC`
        : sql`${orderColumn} ASC`;

    const rates = await context.db
      .select({
        baseCurrency: fxRatesLatest.baseCode,
        quoteCurrency: fxRatesLatest.quoteCode,
        rate: fxRatesLatest.rate,
        effectiveAt: fxRatesLatest.effectiveAt,
        updatedAt: fxRatesLatest.updatedAt,
      })
      .from(fxRatesLatest)
      .where(whereClause)
      .orderBy(orderSql)
      .limit(limit ?? 1000)
      .offset(offset);

    // Transform rates to numbers and ensure type safety
    const items = rates.map((rate) => ({
      baseCurrency: rate.baseCurrency as FiatCurrency,
      quoteCurrency: rate.quoteCurrency as FiatCurrency,
      rate: Number.parseFloat(rate.rate),
      effectiveAt: rate.effectiveAt,
      updatedAt: rate.updatedAt,
    }));

    return {
      items,
      totalCount: total,
      offset,
      limit,
    };
  });
