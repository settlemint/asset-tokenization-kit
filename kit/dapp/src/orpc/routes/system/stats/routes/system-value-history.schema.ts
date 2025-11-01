import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

/**
 * @why Number not string: createTimeSeries converts TheGraph's string values to numbers for chart usage
 */
export const StatsSystemValueHistoryOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  data: z.array(
    z.object({
      timestamp: timestamp(),
      totalValueInBaseCurrency: z.number(),
    })
  ),
});

export type StatsSystemValueHistoryOutput = z.infer<
  typeof StatsSystemValueHistoryOutputSchema
>;
