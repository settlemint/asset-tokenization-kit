import { z } from "zod";

/**
 * Input schema for transaction count endpoint
 */
export const TokenStatsTransactionCountInputSchema = z.object({
  timeRange: z.number().int().min(1).max(365).default(7),
});

/**
 * Output schema for transaction count endpoint
 */
export const TokenStatsTransactionCountOutputSchema = z.object({
  totalTransactions: z.number().int().min(0),
  recentTransactions: z.number().int().min(0),
  timeRangeDays: z.number().int().min(1).max(365),
});

export type TokenStatsTransactionCountInput = z.infer<
  typeof TokenStatsTransactionCountInputSchema
>;
export type TokenStatsTransactionCountOutput = z.infer<
  typeof TokenStatsTransactionCountOutputSchema
>;
