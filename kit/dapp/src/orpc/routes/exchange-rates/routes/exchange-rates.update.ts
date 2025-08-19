/**
 * Exchange Rates Update Route
 *
 * Allows manual updates of exchange rates.
 * @module ExchangeRatesUpdate
 */
import { currencies, fxRates, fxRatesLatest } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq, sql } from "drizzle-orm";

/**
 * Exchange rate update route handler.
 *
 * Allows manual updates of exchange rates. This is useful for:
 * - Overriding rates when external APIs are unavailable
 * - Setting custom rates for testing
 * - Correcting incorrect rates
 *
 * The handler validates the currencies exist and updates both
 * the time-series and latest rates tables.
 *
 * Authentication: Required
 * Permissions: Requires admin or issuer role
 * Method: PUT /exchange-rates/:baseCurrency/:quoteCurrency
 * @param input - Update parameters including the new rate
 * @param context - Request context with database connection
 * @returns Success status and updated rate details
 */
export const update = authRouter.exchangeRates.update
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { exchangeRates: ["update"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    const {
      baseCurrency,
      quoteCurrency,
      rate,
      effectiveAt = new Date(),
    } = input;

    // Validate currencies exist
    const [baseCurrencyExists] = await context.db
      .select()
      .from(currencies)
      .where(eq(currencies.code, baseCurrency))
      .limit(1);

    if (!baseCurrencyExists) {
      throw errors.NOT_FOUND({
        message: `Base currency ${baseCurrency} not found`,
      });
    }

    const [quoteCurrencyExists] = await context.db
      .select()
      .from(currencies)
      .where(eq(currencies.code, quoteCurrency))
      .limit(1);

    if (!quoteCurrencyExists) {
      throw errors.NOT_FOUND({
        message: `Quote currency ${quoteCurrency} not found`,
      });
    }

    // Convert rate to string for storage
    const rateString = rate.toFixed(18);

    // Update in transaction
    await context.db.transaction(async (tx) => {
      // Insert into time-series table
      await tx.insert(fxRates).values({
        baseCode: baseCurrency,
        quoteCode: quoteCurrency,
        provider: "manual",
        rate: rateString,
        effectiveAt,
      });

      // Upsert into latest rates table
      await tx
        .insert(fxRatesLatest)
        .values({
          baseCode: baseCurrency,
          quoteCode: quoteCurrency,
          provider: "manual",
          rate: rateString,
          effectiveAt,
        })
        .onConflictDoUpdate({
          target: [
            fxRatesLatest.baseCode,
            fxRatesLatest.quoteCode,
            fxRatesLatest.provider,
          ],
          set: {
            rate: rateString,
            effectiveAt,
            updatedAt: sql`NOW()`,
          },
        });
    });

    return {
      success: true,
      rate: {
        baseCurrency,
        quoteCurrency,
        rate,
        effectiveAt,
      },
    };
  });
