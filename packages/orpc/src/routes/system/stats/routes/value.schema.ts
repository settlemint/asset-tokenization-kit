import { z } from "zod";

/**
 * Input schema for system value endpoint
 */
export const StatsValueInputSchema = z.object({}).strict();

/**
 * Output schema for system value endpoint
 */
export const StatsValueOutputSchema = z.object({
  totalValue: z.string(),
});

export type StatsValueInput = z.infer<typeof StatsValueInputSchema>;
export type StatsValueOutput = z.infer<typeof StatsValueOutputSchema>;
