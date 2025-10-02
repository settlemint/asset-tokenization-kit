import { formatDate } from "@/lib/utils/date";
import type { StatsResolvedRange } from "@atk/zod/stats-range";
import {
  type Interval,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameHour,
  isSameMonth,
  startOfDay,
  startOfHour,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";

export type TimeGranularity = "hour" | "day" | "month";
export type IntervalType = "year" | "month" | "week" | "day";
export type AggregationType = "first" | "last" | "sum" | "count" | "max";
export type AccumulationType = "total" | "max" | "current"; // If more than one value on the X axis have the same Y axis value, the accumulation type will be used to determine how the matching X axis values will be accumulated

export interface AggregationOptions {
  display: AggregationType;
  storage: AggregationType;
}

export interface TimeSeriesOptions {
  range: StatsResolvedRange;
  aggregation: AggregationType | AggregationOptions;
  accumulation?: AccumulationType;
  historical?: boolean;
}

export type DataPoint = {
  timestamp: Date;
  [key: string]: unknown;
};

export type TimeSeriesResult<T> = {
  timestamp: Date;
} & {
  [K in keyof T]: number;
};

/**
 * Creates a time series with consistent intervals from raw data points
 *
 * @param data - Array of data points with timestamp and values
 * @param valueKeys - Array of keys to extract from data points
 * @param options - Configuration options for time series generation
 * @returns Array of processed data points with consistent intervals
 */
export function createTimeSeries<T extends DataPoint>(
  data: T[],
  valueKeys: (keyof T)[],
  options: TimeSeriesOptions
): TimeSeriesResult<T>[] {
  const { accumulation, aggregation, historical, range } = options;

  // Normalize aggregation options
  const { display: displayAggregation, storage: storageAggregation } =
    typeof aggregation === "string"
      ? { display: aggregation, storage: aggregation }
      : aggregation;

  // Generate ticks based on granularity
  const interval: Interval<Date> = {
    start: range.from,
    end: range.to,
  };
  const granularity = range.interval;
  const ticks = getTicks(granularity, interval);

  // Initialize last valid values for each key
  const lastValidValues = new Map<keyof T, number>();
  for (const key of valueKeys) {
    const initialValue = historical
      ? findClosestHistoricalValue(data, key, interval.start)
      : 0;
    lastValidValues.set(key, initialValue);
  }

  return ticks.map((tick) => {
    const matchingDataForTick = data.filter((d) =>
      isInTick(tick, d.timestamp, granularity)
    );

    // Get both display and storage aggregated values
    const displayData = aggregateData(
      matchingDataForTick,
      valueKeys,
      displayAggregation
    );
    const storageData = aggregateData(
      matchingDataForTick,
      valueKeys,
      storageAggregation
    );

    const result = {
      timestamp: tick,
    } as TimeSeriesResult<Pick<T, keyof T>>;

    for (const key of valueKeys) {
      const displayValue = Number(displayData?.[key]);
      const storageValue = Number(storageData?.[key]);

      const processedValue = processTimeSeriesValue(
        displayValue,
        lastValidValues.get(key) ?? 0,
        accumulation
      );

      // Update last valid value with the storage value instead of processed value
      if (storageValue) {
        lastValidValues.set(key, storageValue);
      }

      Object.assign(result, { [key]: processedValue });
    }

    return result;
  });
}

function getTicks(granularity: TimeGranularity, interval: Interval) {
  switch (granularity) {
    case "hour":
      return eachHourOfInterval(interval);
    case "day":
      return eachDayOfInterval(interval);
    case "month":
      return eachMonthOfInterval(interval);
    default:
      throw new Error("Invalid granularity");
  }
}

export function getInterval(
  granularity: TimeGranularity,
  intervalType: IntervalType,
  intervalLength: number
): Interval<Date> {
  const now = new Date();

  // First round the current time based on granularity
  const roundedNow =
    granularity === "hour" ? startOfHour(now) : startOfDay(now);

  let start: Date;
  switch (intervalType) {
    case "month":
      start = subMonths(roundedNow, intervalLength);
      break;
    case "week":
      start = subWeeks(roundedNow, intervalLength);
      break;
    case "day":
      start = subDays(roundedNow, intervalLength);
      break;
    case "year":
      start = subYears(roundedNow, intervalLength);
      break;
    default:
      throw new Error("Invalid interval type");
  }

  return { start, end: roundedNow };
}

function isInTick(
  tick: Date,
  timestamp: Date,
  granularity: TimeGranularity
): boolean {
  const timestampDate = timestamp;
  switch (granularity) {
    case "hour":
      return isSameHour(timestampDate, tick);
    case "month":
      return isSameMonth(timestampDate, tick);
    case "day":
      return isSameDay(timestampDate, tick);
    default:
      throw new Error("Invalid granularity");
  }
}

export function formatChartDate(
  value: Date | string | number,
  granularity: TimeGranularity,
  locale: string
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("Invalid date value provided to formatChartDate");
  }

  if (granularity === "hour") {
    return formatDate(date, "HH:mm, MMM d", locale);
  }
  if (granularity === "day") {
    return formatDate(date, "MMM d", locale);
  }
  if (granularity === "month") {
    return formatDate(date, "MMM y", locale);
  }
  throw new Error("Invalid granularity");
}

function aggregateData<T extends DataPoint>(
  matchingData: T[],
  valueKeys: (keyof T)[],
  aggregation: AggregationType
): Record<keyof T, unknown> | null {
  switch (aggregation) {
    case "sum":
      return valueKeys.reduce(
        (acc, key) => {
          const sum = matchingData.reduce((sum, d) => sum + Number(d[key]), 0);
          acc[key] = sum;
          return acc;
        },
        {} as Record<keyof T, number>
      );
    case "count":
      return valueKeys.reduce(
        (acc, key) => {
          acc[key] = matchingData.length;
          return acc;
        },
        {} as Record<keyof T, number>
      );
    case "first":
      return valueKeys.reduce(
        (acc, key) => {
          const firstDataPoint = matchingData.find((d) => d[key] !== undefined);
          acc[key] = firstDataPoint?.[key];
          return acc;
        },
        {} as Record<keyof T, unknown>
      );
    case "last":
      return valueKeys.reduce(
        (acc, key) => {
          const reversedData = [...matchingData].toReversed();
          const lastDataPoint = reversedData.find((d) => d[key] !== undefined);
          acc[key] = lastDataPoint?.[key];
          return acc;
        },
        {} as Record<keyof T, unknown>
      );
    case "max":
      return valueKeys.reduce(
        (acc, key) => {
          const maxValue = matchingData.reduce((max, d) => {
            const value = Number(d[key]);
            return Number.isNaN(value) ? max : Math.max(max, value);
          }, 0);
          acc[key] = maxValue;
          return acc;
        },
        {} as Record<keyof T, number>
      );
    default:
      throw new Error("Unsupported aggregation type");
  }
}

function processTimeSeriesValue(
  currentValue: number | null,
  lastValidValue: number,
  accumulation?: AccumulationType
): number {
  if (!currentValue) {
    return accumulation ? lastValidValue : 0;
  }

  switch (accumulation) {
    case "total":
      return currentValue + lastValidValue;
    case "max":
      return Math.max(currentValue, lastValidValue);
    case "current":
      return currentValue;
    default:
      return currentValue;
  }
}

function findClosestHistoricalValue<T extends DataPoint>(
  data: T[],
  key: keyof T,
  start: Date
): number {
  if (data.length === 0) {
    return 0;
  }
  const startDate = start;
  const validPoints = data
    .filter((d) => {
      const value = d[key];
      return (
        d.timestamp <= startDate &&
        value !== undefined &&
        value !== null &&
        !Number.isNaN(Number(value))
      );
    })
    .toSorted((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return validPoints.length > 0 ? Number(validPoints[0]?.[key]) : 0;
}
