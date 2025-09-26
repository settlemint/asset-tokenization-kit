import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

/**
 * Output schema for portfolio endpoint
 */
export const StatsPortfolioOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  data: z.array(
    z.object({
      timestamp: timestamp(),
      totalValueInBaseCurrency: z.string(),
    })
  ),
});

export type StatsPortfolioOutput = z.infer<typeof StatsPortfolioOutputSchema>;
