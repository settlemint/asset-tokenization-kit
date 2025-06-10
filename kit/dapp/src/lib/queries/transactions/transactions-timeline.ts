import "server-only";

import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
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

const TimelineResultSchema = t.Object({
  start: t.Timestamp({
    description: "The start time of this timeline period",
  }),
  end: t.Timestamp({
    description: "The end time of this timeline period",
  }),
  count: t.Number({
    description: "The count of transactions in this period",
  }),
});

type TimelineResult = StaticDecode<typeof TimelineResultSchema>;

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
export const getTransactionsTimeline = withTracing(
  "queries",
  "getTransactionsTimeline",
  async (props: TransactionsTimelineProps) => {
    "use cache";
    cacheTag("asset");
    const { from, granularity, timelineStartDate } = props;
    const transactionsTimeline = await portalClient.request(
      ProcessedTransactionsTimeline,
      {
        from,
        granularity,
        timelineStartDate: timelineStartDate.toJSON(),
      }
    );

    const timelineData = safeParse(
      t.Array(TimelineResultSchema),
      transactionsTimeline.getTransactionsTimeline
    );

    return timelineData.map((item: TimelineResult) => ({
      timestamp: item.start.toJSON(),
      transaction: item.count,
    }));
  }
);
