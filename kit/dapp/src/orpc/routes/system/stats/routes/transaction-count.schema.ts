import { z } from "zod";

/**
 * Input schema for system transaction count endpoint
 */
export const StatsTransactionCountInputSchema = z.object({
  timeRange: z.number().int().min(1).max(365).default(7),
});

/**
 * Output schema for system transaction count endpoint
 */
export const StatsTransactionCountOutputSchema = z.object({
  totalTransactions: z.number().int().min(0),
  recentTransactions: z.number().int().min(0),
  timeRangeDays: z.number().int().min(1).max(365),
});

export type StatsTransactionCountInput = z.infer<
  typeof StatsTransactionCountInputSchema
>;
export type StatsTransactionCountOutput = z.infer<
  typeof StatsTransactionCountOutputSchema
>;
