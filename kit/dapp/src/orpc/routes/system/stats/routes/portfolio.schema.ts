import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

/**
 * Output schema for portfolio endpoint
 */
export const StatsPortfolioOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  data: z.array(
    z.object({
      timestamp: timestamp(),
      totalValueInBaseCurrency: z.number(),
    })
  ),
});

export type StatsPortfolioOutput = z.infer<typeof StatsPortfolioOutputSchema>;
