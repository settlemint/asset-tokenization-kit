import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

export const StatsAssetLifecycleOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  data: z.array(
    z.object({
      timestamp: timestamp(),
      assetsCreated: z.number(),
      assetsLaunched: z.number(),
    })
  ),
});

export type StatsAssetLifecycleOutput = z.infer<
  typeof StatsAssetLifecycleOutputSchema
>;
