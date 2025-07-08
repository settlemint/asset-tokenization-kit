import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { z } from "zod/v4";

/**
 * GraphQL query to fetch system-wide value metrics
 * Simple query focused only on total value in base currency
 */
const VALUE_METRICS_QUERY = theGraphGraphql(`
  query ValueMetrics($systemId: ID!) {
    systemStatsState(id: $systemId) {
      totalValueInBaseCurrency
    }
  }
`);

// Schema for the GraphQL response
const ValueMetricsResponseSchema = z.object({
  systemStatsState: z
    .object({
      totalValueInBaseCurrency: z.string(),
    })
    .nullable(),
});

/**
 * Value statistics route handler.
 *
 * Fetches the total value of all assets in the system.
 * This is a lightweight endpoint optimized for frequent updates.
 *
 * The value is returned in the system's base currency and is
 * calculated by the subgraph based on token supplies and prices.
 *
 * Authentication: Required
 * Method: GET /token/stats/value
 *
 * @returns Promise<ValueMetrics> - Total value in base currency
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get the total system value
 * const { totalValue } = await orpc.token.statsValue.query();
 * console.log(`Total system value: ${totalValue}`);
 * ```
 */
export const statsValue = authRouter.token.statsValue
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context, errors }) => {
    // Ensure system context exists
    if (!context.system) {
      throw errors.SYSTEM_NOT_CREATED();
    }

    // Fetch system value from TheGraph
    const response = await context.theGraphClient.query(VALUE_METRICS_QUERY, {
      input: {
        systemId: context.system.address.toLowerCase(),
      },
      output: ValueMetricsResponseSchema,
      error: "Failed to fetch value metrics",
    });

    // Extract total value, defaulting to "0" if no system stats
    const totalValue =
      response.systemStatsState?.totalValueInBaseCurrency ?? "0";

    return {
      totalValue,
    };
  });
