import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { z } from "zod";

/**
 * GraphQL query to fetch system-wide total value metrics
 * Optimized for the Value Stats Widget specifically
 */
const TOTAL_VALUE_QUERY = theGraphGraphql(`
  query TotalValue($systemId: ID!) {
    systemStatsState(id: $systemId) {
      totalValueInBaseCurrency
    }
  }
`);

// Schema for the GraphQL response
const TotalValueResponseSchema = z.object({
  systemStatsState: z
    .object({
      totalValueInBaseCurrency: z.string(),
    })
    .nullable(),
});

/**
 * Total value route handler.
 *
 * Fetches the total value of all assets in the system specifically for the Value Stats Widget.
 * This is a lightweight endpoint optimized for frequent updates.
 *
 * The value is returned in the system's base currency and is
 * calculated by the subgraph based on token supplies and prices.
 *
 * Authentication: Required
 * Method: GET /token/stats/total-value
 *
 * @returns Promise<TotalValueMetrics> - Total value in base currency
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get the total system value
 * const { totalValue } = await orpc.token.statsTotalValue.query();
 * console.log(`Total system value: ${totalValue}`);
 * ```
 */
export const statsTotalValue = authRouter.token.statsTotalValue
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    // System context is guaranteed by systemMiddleware

    // Fetch system value from TheGraph
    const response = await context.theGraphClient.query(TOTAL_VALUE_QUERY, {
      input: {
        systemId: context.system.address.toLowerCase(),
      },
      output: TotalValueResponseSchema,
      error: "Failed to fetch total value",
    });

    // Extract total value, defaulting to "0" if no system stats
    const totalValue =
      response.systemStatsState?.totalValueInBaseCurrency ?? "0";

    return {
      totalValue,
    };
  });
