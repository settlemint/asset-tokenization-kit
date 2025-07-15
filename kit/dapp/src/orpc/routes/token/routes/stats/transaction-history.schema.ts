import { z } from "zod";

/**
 * Input schema for transaction history endpoint
 */
export const TokenStatsTransactionHistoryInputSchema = z.object({
  timeRange: z.number().int().min(1).max(365).default(7),
});

/**
 * Output schema for transaction history endpoint
 */
export const TokenStatsTransactionHistoryOutputSchema = z.object({
  transactionHistory: z.array(
    z.object({
      timestamp: z.string(),
      transactions: z.number().int().min(0),
    })
  ),
  timeRangeDays: z.number().int().min(1).max(365),
});

export type TokenStatsTransactionHistoryInput = z.infer<
  typeof TokenStatsTransactionHistoryInputSchema
>;
export type TokenStatsTransactionHistoryOutput = z.infer<
  typeof TokenStatsTransactionHistoryOutputSchema
>;
