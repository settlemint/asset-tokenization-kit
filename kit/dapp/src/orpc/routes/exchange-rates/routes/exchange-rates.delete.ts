/**
 * Exchange Rates Delete Route
 *
 * Allows deletion of manual exchange rates.
 * @module ExchangeRatesDelete
 */
import { fxRatesLatest } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { and, eq } from "drizzle-orm";

/**
 * Exchange rate delete route handler.
 *
 * Deletes a manual exchange rate from the latest rates table.
 * Only rates with provider="manual" can be deleted to prevent
 * accidental removal of synced rates from external providers.
 *
 * Note: This only removes the rate from the latest table.
 * Historical entries in the time-series table are preserved
 * for audit and compliance purposes.
 *
 * Authentication: Required
 * Permissions: Requires admin role
 * Method: DELETE /exchange-rates/:baseCurrency/:quoteCurrency
 * @param input - Delete parameters
 * @param context - Request context with database connection
 * @returns Success status
 */
export const del = authRouter.exchangeRates.delete
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { exchangeRates: ["remove"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { baseCurrency, quoteCurrency } = input;

    // Check if the rate exists and is manual
    const [existingRate] = await context.db
      .select()
      .from(fxRatesLatest)
      .where(
        and(
          eq(fxRatesLatest.baseCode, baseCurrency),
          eq(fxRatesLatest.quoteCode, quoteCurrency),
          eq(fxRatesLatest.provider, "manual")
        )
      )
      .limit(1);

    if (!existingRate) {
      throw errors.NOT_FOUND({
        message: `No manual exchange rate found for ${baseCurrency}/${quoteCurrency}`,
      });
    }

    // Delete the manual rate
    await context.db
      .delete(fxRatesLatest)
      .where(
        and(
          eq(fxRatesLatest.baseCode, baseCurrency),
          eq(fxRatesLatest.quoteCode, quoteCurrency),
          eq(fxRatesLatest.provider, "manual")
        )
      );

    return {
      success: true,
    };
  });
