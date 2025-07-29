import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { z } from "zod";

/**
 * GraphQL query to fetch system-wide value metrics
 */
const VALUE_QUERY = theGraphGraphql(`
  query ValueMetrics($systemId: ID!) {
    systemStatsState(id: $systemId) {
      totalValueInBaseCurrency
    }
  }
`);

// Schema for the GraphQL response
const ValueResponseSchema = z.object({
  systemStatsState: z
    .object({
      totalValueInBaseCurrency: z.string(),
    })
    .nullable(),
});

/**
 * Value statistics route handler.
 * GET /stats/value
 */
export const value = authRouter.token.statsValue
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    // Fetch system value from TheGraph
    const response = await context.theGraphClient.query(VALUE_QUERY, {
      input: {
        systemId: context.system.address.toLowerCase(),
      },
      output: ValueResponseSchema,
      error: "Failed to fetch value metrics",
    });

    // Extract total value, defaulting to "0" if no system stats
    const totalValue =
      response.systemStatsState?.totalValueInBaseCurrency ?? "0";

    return {
      totalValue,
    };
  });

/**
 * Total value statistics route handler.
 * GET /stats/total-value
 */
export const totalValue = authRouter.token.statsTotalValue
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    // Fetch system value from TheGraph
    const response = await context.theGraphClient.query(VALUE_QUERY, {
      input: {
        systemId: context.system.address.toLowerCase(),
      },
      output: ValueResponseSchema,
      error: "Failed to fetch total value",
    });

    // Extract total value, defaulting to "0" if no system stats
    const totalValue =
      response.systemStatsState?.totalValueInBaseCurrency ?? "0";

    return {
      totalValue,
    };
  });
