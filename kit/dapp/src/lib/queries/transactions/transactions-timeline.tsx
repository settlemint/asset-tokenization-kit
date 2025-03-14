import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

const ProcessedTransactionsTimeline = portalGraphql(
  `query ProcessedTransactionsTimeline($granularity: TransactionTimelineGranularity!, $timelineStartDate: String!, $from: String) {
    getTransactionsTimeline(granularity: $granularity, timelineStartDate: $timelineStartDate, from: $from) {
      count
      start
      end
    }
  }`
);

const TransactionTimelineSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
  count: z.number(),
});

/**
 * Props interface for transaction timeline queries
 */
export interface TransactionsTimelineProps {
  from?: Address;
  timelineStartDate: Date;
  granularity: ReturnType<
    typeof portalGraphql.scalar<"TransactionTimelineGranularity">
  >;
}

/**
 * Fetches transaction timeline data for a specific address
 *
 * @param props - Props containing the address to query, timeline start date, and granularity
 * @returns An array of timeline data points with timestamp and transaction count
 *
 * @remarks
 * This function fetches aggregated transaction timeline data based on the specified
 * granularity (day, week, month, etc.) starting from the provided date.
 * The data is validated against the schema before being returned.
 */
export const getTransactionsTimeline = cache(
  async (props: TransactionsTimelineProps) => {
    const { from, granularity, timelineStartDate } = props;
    const transactionsTimeline = await portalClient.request(
      ProcessedTransactionsTimeline,
      {
        from,
        granularity,
        timelineStartDate: timelineStartDate.toJSON(),
      }
    );
    const mapped = z
      .array(TransactionTimelineSchema)
      .parse(transactionsTimeline.getTransactionsTimeline);
    return mapped.map((item) => ({
      timestamp: item.start.toJSON(),
      transaction: item.count,
    }));
  }
);
