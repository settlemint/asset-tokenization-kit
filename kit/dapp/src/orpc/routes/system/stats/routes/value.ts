import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
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
 * System value route handler.
 *
 * Fetches the total value of all assets in the system.
 * This is a lightweight endpoint optimized for frequent updates.
 *
 * The value is returned in the system's base currency and is
 * calculated by the subgraph based on token supplies and prices.
 *
 * Authentication: Required
 * Method: GET /token/stats/system/value
 *
 * @returns Promise<SystemValueMetrics> - Total system value in base currency
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get the total system value
 * const { totalValue } = await orpc.system.stats.value.query();
 * console.log(`Total system value: ${totalValue}`);
 * ```
 */
export const statsValue = systemRouter.system.stats.value.handler(
  async ({ context }) => {
    // System context is guaranteed by systemMiddleware

    // Fetch system value from TheGraph
    const response = await context.theGraphClient.query(TOTAL_VALUE_QUERY, {
      input: {
        systemId: context.system.id.toLowerCase(),
      },
      output: TotalValueResponseSchema,
    });

    // Extract total value, defaulting to "0" if no system stats
    const totalValue =
      response.systemStatsState?.totalValueInBaseCurrency ?? "0";

    return {
      totalValue,
    };
  }
);
