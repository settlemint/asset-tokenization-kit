import { z } from "zod";

/**
 * Schema for value statistics output
 * Contains the total value of all assets in the system
 */
export const TokenStatsValueOutputSchema = z.object({
  /** Total value of all assets in the base currency (as string to preserve precision) */
  totalValue: z.string(),
});

/**
 * Type definition for value statistics
 */
export type TokenStatsValue = z.infer<typeof TokenStatsValueOutputSchema>;
