import { z } from "zod/v4";

/**
 * Schema for value metrics output
 * Contains the total value of all assets in the system
 */
export const ValueMetricsOutputSchema = z.object({
  /** Total value of all assets in the base currency (as string to preserve precision) */
  totalValue: z.string(),
});

/**
 * Type definition for value metrics
 */
export type ValueMetrics = z.infer<typeof ValueMetricsOutputSchema>;

