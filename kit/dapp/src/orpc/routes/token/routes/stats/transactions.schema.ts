import { z } from "zod";

/**
 * Input schema for transaction endpoints (both system and asset-specific)
 */
export const TransactionsInputSchema = z
  .object({
    timeRange: z
      .number()
      .int()
      .min(1)
      .max(365)
      .default(7)
      .describe("Number of days to look back for transaction data"),
  })
  .strict();

/**
 * Output schema for system-wide transaction data
 */
export const SystemTransactionsOutputSchema = z.object({
  totalTransactions: z.number().int().min(0),
  recentTransactions: z.number().int().min(0),
  transactionHistory: z.array(
    z.object({
      timestamp: z.string(),
      transactions: z.number().int().min(0),
    })
  ),
  timeRangeDays: z.number().int().min(1).max(365),
});

/**
 * Output schema for asset-specific transaction data
 */
export const AssetTransactionsOutputSchema = z.object({
  tokenId: z.string(),
  timeRangeDays: z.number().int().min(1),
  transactionHistory: z.array(
    z.object({
      timestamp: z.string(),
      transactions: z.number().int().min(0),
    })
  ),
  totalEvents: z.number().int().min(0),
});

/**
 * Combined output schema for transaction endpoints
 */
export const TransactionsOutputSchema = z.union([
  SystemTransactionsOutputSchema,
  AssetTransactionsOutputSchema,
]);

export type TransactionsInput = z.infer<typeof TransactionsInputSchema>;
export type SystemTransactionsOutput = z.infer<
  typeof SystemTransactionsOutputSchema
>;
export type AssetTransactionsOutput = z.infer<
  typeof AssetTransactionsOutputSchema
>;
export type TransactionsOutput = z.infer<typeof TransactionsOutputSchema>;
