import { baseContract } from "@/orpc/procedures/base.contract";
import {
  StatsYieldDistributionInputSchema,
  StatsYieldDistributionOutputSchema,
} from "@/orpc/routes/token/routes/stats/yield-distribution.schema";

/**
 * OpenAPI contract definition for the bond yield distribution endpoint.
 *
 * This contract serves multiple purposes:
 * 1. API Documentation: Generates OpenAPI specs for developer documentation
 * 2. Type Safety: Ensures request/response types match across client/server
 * 3. Validation: Automatically validates inputs using the defined schemas
 * 4. Route Definition: Declares the HTTP method, path pattern, and metadata
 *
 * The endpoint is designed for analytics dashboards and yield tracking interfaces
 * that need historical yield generation and claiming data for visualization.
 *
 * @example
 * GET /api/token/0x1234.../stats/yield-distribution
 * Returns: { periods: [...], totalYield: [...], totalClaimed: [...] }
 */
export const statsYieldDistributionContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/stats/yield-distribution",
    description: "Get bond yield distribution statistics for a specific token",
    successDescription:
      "Yield distribution data showing generation and claims over time",
    tags: ["token", "stats", "yield"],
  })
  .input(StatsYieldDistributionInputSchema)
  .output(StatsYieldDistributionOutputSchema);
