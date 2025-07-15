import { z } from "zod";

/**
 * Input schema for total value endpoint
 */
export const TokenStatsTotalValueInputSchema = z.object({}).strict();

/**
 * Output schema for total value endpoint
 */
export const TokenStatsTotalValueOutputSchema = z.object({
  totalValue: z.string(),
});

export type TokenStatsTotalValueInput = z.infer<
  typeof TokenStatsTotalValueInputSchema
>;
export type TokenStatsTotalValueOutput = z.infer<
  typeof TokenStatsTotalValueOutputSchema
>;
