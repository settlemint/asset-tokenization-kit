import { baseContract } from "@/orpc/procedures/base.contract";
import { MetricsSummarySchema } from "@/orpc/routes/metrics/routes/metrics.summary.schema";
import { AssetMetricsOutputSchema } from "@/orpc/routes/metrics/schemas/asset-metrics.schema";
import {
  TransactionMetricsInputSchema,
  TransactionMetricsOutputSchema,
} from "@/orpc/routes/metrics/schemas/transaction-metrics.schema";
import {
  UserMetricsInputSchema,
  UserMetricsOutputSchema,
} from "@/orpc/routes/metrics/schemas/user-metrics.schema";
import { ValueMetricsOutputSchema } from "@/orpc/routes/metrics/schemas/value-metrics.schema";
import { z } from "zod/v4";

/**
 * Asset metrics endpoint contract
 * Provides comprehensive asset-related metrics including counts, breakdowns, and activity
 */
const assets = baseContract
  .route({
    method: "GET",
    path: "/metrics/assets",
    description:
      "Get comprehensive asset metrics including counts, breakdowns, and activity data",
    successDescription: "Asset metrics retrieved successfully",
    tags: ["metrics", "assets"],
  })
  .input(z.object({}))
  .output(AssetMetricsOutputSchema);

/**
 * User metrics endpoint contract
 * Provides user-related metrics including totals and growth over time
 */
const users = baseContract
  .route({
    method: "GET",
    path: "/metrics/users",
    description:
      "Get user metrics including total counts and growth data over time",
    successDescription: "User metrics retrieved successfully",
    tags: ["metrics", "users"],
  })
  .input(UserMetricsInputSchema)
  .output(UserMetricsOutputSchema);

/**
 * Transaction metrics endpoint contract
 * Provides transaction-related metrics including totals and history over time
 */
const transactions = baseContract
  .route({
    method: "GET",
    path: "/metrics/transactions",
    description:
      "Get transaction metrics including total counts and history data over time",
    successDescription: "Transaction metrics retrieved successfully",
    tags: ["metrics", "transactions"],
  })
  .input(TransactionMetricsInputSchema)
  .output(TransactionMetricsOutputSchema);

/**
 * Value metrics endpoint contract
 * Provides the total value of all assets in the system
 */
const value = baseContract
  .route({
    method: "GET",
    path: "/metrics/value",
    description:
      "Get the total value of all assets in the system's base currency",
    successDescription: "Value metrics retrieved successfully",
    tags: ["metrics", "value"],
  })
  .input(z.object({}))
  .output(ValueMetricsOutputSchema);

/**
 * Legacy summary endpoint contract (deprecated)
 * Provides all metrics in a single call - kept for backward compatibility
 */
const summary = baseContract
  .route({
    method: "GET",
    path: "/metrics/summary",
    description:
      "[DEPRECATED] Get aggregated metrics summary for dashboards. Use focused endpoints instead.",
    successDescription: "Metrics summary retrieved successfully",
    tags: ["metrics", "deprecated"],
  })
  .input(z.object({}))
  .output(MetricsSummarySchema);

export const metricsContract = {
  assets,
  users,
  transactions,
  value,
  summary, // Keep for backward compatibility
};
