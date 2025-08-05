import { z } from "zod";
import { bigDecimal } from "@/lib/zod/validators/bigdecimal";

// Input schema
export const StatsBondYieldCoverageInputSchema = z.object({
  tokenAddress: z.string(),
});

export type StatsBondYieldCoverageInput = z.infer<
  typeof StatsBondYieldCoverageInputSchema
>;

// Output schema
export const StatsBondYieldCoverageOutputSchema = z.object({
  hasYieldSchedule: z.boolean(),
  isRunning: z.boolean(),
  yieldCoverage: bigDecimal(),
});

export type StatsBondYieldCoverageOutput = z.infer<
  typeof StatsBondYieldCoverageOutputSchema
>;
