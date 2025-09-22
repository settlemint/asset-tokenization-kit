import { z } from "zod";

/**
 * Input schema for portfolio endpoint
 */
export const StatsPortfolioInputSchema = z.object({
  from: z.string().optional().describe("Start timestamp (ISO string)"),
  to: z.string().optional().describe("End timestamp (ISO string)"),
  interval: z.enum(["hour", "day"]).default("day"),
});

/**
 * Output schema for portfolio endpoint
 */
export const StatsPortfolioOutputSchema = z.object({
  data: z.array(
    z.object({
      timestamp: z.string(),
      totalValueInBaseCurrency: z.string(),
    })
  ),
});

export type StatsPortfolioInput = z.infer<typeof StatsPortfolioInputSchema>;
export type StatsPortfolioOutput = z.infer<typeof StatsPortfolioOutputSchema>;
