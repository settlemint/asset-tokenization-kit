import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

export const StatsAssetActivityOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  data: z.array(
    z.object({
      timestamp: timestamp(),
      transferEventsCount: z.number(),
      mintEventsCount: z.number(),
      burnEventsCount: z.number(),
    })
  ),
});

export type StatsAssetActivityOutput = z.infer<
  typeof StatsAssetActivityOutputSchema
>;
