import { z } from "zod";

/**
 * Input schema for system value endpoint
 */
export const TokenStatsSystemValueInputSchema = z.object({}).strict();

/**
 * Output schema for system value endpoint
 */
export const TokenStatsSystemValueOutputSchema = z.object({
  totalValue: z.string(),
});

export type TokenStatsSystemValueInput = z.infer<
  typeof TokenStatsSystemValueInputSchema
>;
export type TokenStatsSystemValueOutput = z.infer<
  typeof TokenStatsSystemValueOutputSchema
>;
