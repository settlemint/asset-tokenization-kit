import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { createTimeSeries } from "@/lib/utils/timeseries";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

/**
 * @why Two ID formats: TheGraph requires String for filtering, ID for entity lookups
 */
const SYSTEM_VALUE_HISTORY_QUERY = theGraphGraphql(`
  query SystemValueHistory(
    $systemIdString: String!
    $systemId: ID!
    $interval: Aggregation_interval!
    $fromMicroseconds: Timestamp!
    $toMicroseconds: Timestamp!
  ) {
    systemStats: systemStats_collection(
      interval: $interval
      where: {
        system: $systemIdString
        timestamp_gte: $fromMicroseconds
        timestamp_lte: $toMicroseconds
      }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      totalValueInBaseCurrency
    }
    baseline: systemStats_collection(
      interval: $interval
      where: {
        system: $systemIdString
        timestamp_lte: $fromMicroseconds
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      timestamp
      totalValueInBaseCurrency
    }
    current: systemStatsState(id: $systemId) {
      totalValueInBaseCurrency
    }
  }
`);

// @why String: TheGraph returns values as strings for precision; converted to number in createTimeSeries
const SystemValueHistoryItemSchema = z.object({
  timestamp: timestamp(),
  totalValueInBaseCurrency: z.string(),
});

// @why current nullable: New systems may not have stats yet
const SystemValueHistoryResponseSchema = z.object({
  systemStats: z.array(SystemValueHistoryItemSchema),
  baseline: z.array(SystemValueHistoryItemSchema),
  current: z
    .object({
      totalValueInBaseCurrency: z.string(),
    })
    .nullable(),
});

/**
 * System value history route handler (by range).
 *
 * Fetches the historical total value for the system over the specified
 * time range and interval.
 *
 * The system value represents the total value of all tokens in the system,
 * calculated in the base currency.
 *
 * Authentication: Required
 * Method: GET /system/stats/systemValueHistoryByRange
 *
 * @param from - Start timestamp (ISO string, optional)
 * @param to - End timestamp (ISO string, optional)
 * @param interval - Aggregation interval: "hour" or "day" (default: "day")
 * @returns Promise<SystemValueHistoryMetrics> - Time-series system value data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get daily system value data for the last 30 days
 * const { data } = await orpc.system.stats.systemValueHistoryByRange.query({
 *   interval: "day",
 *   from: "2024-01-01T00:00:00Z",
 *   to: "2024-01-31T23:59:59Z"
 * });
 *
 * // Use data for charting
 * data.forEach(point => {
 *   console.log(`${point.timestamp}: ${point.totalValueInBaseCurrency}`);
 * });
 * ```
 */
export const statsSystemValueHistoryByRange =
  systemRouter.system.stats.systemValueHistoryByRange.handler(
    async ({ input, context }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input, {
          now,
          // TODO: replace minFrom with context.system.createdAt when available
        });

      // @why Lowercase: TheGraph stores entity IDs in lowercase
      const systemId = context.system.id.toLowerCase();
      const variables = {
        systemId,
        systemIdString: systemId,
        fromMicroseconds,
        toMicroseconds,
        interval,
      } as const;

      const systemValueData = await context.theGraphClient.query(
        SYSTEM_VALUE_HISTORY_QUERY,
        {
          input: variables,
          output: SystemValueHistoryResponseSchema,
        }
      );

      // Merge baseline + stats + current for complete time series
      const results = [
        ...systemValueData.baseline,
        ...systemValueData.systemStats,
        {
          timestamp: range.to,
          totalValueInBaseCurrency:
            systemValueData.current?.totalValueInBaseCurrency ?? "0",
        },
      ];

      // @why "max" accumulation: Forward-fill gaps with last known value (value persists during inactivity)
      const series = createTimeSeries(results, ["totalValueInBaseCurrency"], {
        range,
        aggregation: "last",
        accumulation: "max",
        historical: true,
      });

      return {
        range,
        data: series,
      };
    }
  );

/**
 * System value history route handler (by preset).
 *
 * Fetches the historical total value for the system using a preset
 * time range (1d, 7d, 30d, 90d, 1y, all).
 *
 * The system value represents the total value of all tokens in the system,
 * calculated in the base currency.
 *
 * Authentication: Required
 * Method: GET /system/stats/systemValueHistoryByPreset
 *
 * @param preset - Time range preset: "1d" | "7d" | "30d" | "90d" | "1y" | "all"
 * @returns Promise<SystemValueHistoryMetrics> - Time-series system value data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get system value data for the last 7 days
 * const { data } = await orpc.system.stats.systemValueHistoryByPreset.query({
 *   preset: "7d"
 * });
 *
 * // Use data for charting
 * data.forEach(point => {
 *   console.log(`${point.timestamp}: ${point.totalValueInBaseCurrency}`);
 * });
 * ```
 */
export const statsSystemValueHistoryByPreset =
  systemRouter.system.stats.systemValueHistoryByPreset.handler(
    async ({ input, context }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input.preset, {
          now,
          // TODO: replace minFrom with context.system.createdAt when available
        });

      const systemId = context.system.id.toLowerCase();
      const variables = {
        systemId,
        systemIdString: systemId,
        fromMicroseconds,
        toMicroseconds,
        interval,
      } as const;

      const systemValueData = await context.theGraphClient.query(
        SYSTEM_VALUE_HISTORY_QUERY,
        {
          input: variables,
          output: SystemValueHistoryResponseSchema,
        }
      );

      // Merge baseline + stats + current for complete time series
      const results = [
        ...systemValueData.baseline,
        ...systemValueData.systemStats,
        {
          timestamp: range.to,
          totalValueInBaseCurrency:
            systemValueData.current?.totalValueInBaseCurrency ?? "0",
        },
      ];

      // @why "max" accumulation: Forward-fill gaps with last known value (value persists during inactivity)
      const series = createTimeSeries(results, ["totalValueInBaseCurrency"], {
        range,
        aggregation: "last",
        accumulation: "max",
        historical: true,
      });

      return {
        range,
        data: series,
      };
    }
  );
