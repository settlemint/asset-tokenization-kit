import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

export const StatsAssetLifecycleInputSchema = z.object({
  from: timestamp().describe("Start timestamp (ISO string)"),
  to: timestamp().describe("End timestamp (ISO string)"),
  interval: z.enum(["hour", "day"]).default("day"),
});

export const StatsAssetLifecycleOutputSchema = z.object({
  data: z.array(
    z.object({
      timestamp: timestamp(),
      assetsCreatedCount: z.number(),
      assetsLaunchedCount: z.number(),
    })
  ),
});

export type StatsAssetLifecycleInput = z.infer<
  typeof StatsAssetLifecycleInputSchema
>;
export type StatsAssetLifecycleOutput = z.infer<
  typeof StatsAssetLifecycleOutputSchema
>;
