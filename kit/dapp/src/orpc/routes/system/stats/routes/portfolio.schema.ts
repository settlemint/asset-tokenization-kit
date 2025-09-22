import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for portfolio endpoint
 */
export const StatsPortfolioInputSchema = z.object({
  from: ethereumAddress.optional(),
  to: ethereumAddress.optional(),
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
