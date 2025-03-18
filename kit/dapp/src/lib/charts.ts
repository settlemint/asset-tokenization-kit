import {
  type Interval,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  format,
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
import { getDateFromTimestamp } from "./utils/date";

export type TimeGranularity = "hour" | "day" | "month";
export type IntervalType = "year" | "month" | "week" | "day";
export type AggregationType = "first" | "sum" | "count";
export type AccumulationType = "total" | "max";

export interface TimeSeriesOptions {
  granularity: TimeGranularity;
  intervalType: IntervalType;
  intervalLength: number;
  aggregation: AggregationType;
  accumulation?: AccumulationType;
  historical?: boolean;
}

type DataPoint = {
  timestamp: number | string | Date;
  [key: string]: unknown;
};

type TimeSeriesResult<T> = {
  timestamp: string;
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
): TimeSeriesResult<Pick<T, keyof T>>[] {
  const {
    granularity,
    intervalType,
    intervalLength,
    accumulation,
    aggregation = "first",
    historical,
  } = options;

  // Generate ticks based on granularity
  const interval: Interval = getInterval(
    granularity,
    intervalType,
    intervalLength
  );
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
    const aggregatedData = aggregateData(
      matchingDataForTick,
      valueKeys,
      aggregation
    );

    const result = {
      timestamp: formatChartDate(tick, granularity),
    } as TimeSeriesResult<Pick<T, keyof T>>;

    for (const key of valueKeys) {
      const processedValue = processTimeSeriesValue(
        Number(aggregatedData?.[key]),
        lastValidValues.get(key) ?? 0,
        accumulation
      );

      updateLastValidValue(lastValidValues, key, processedValue);
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
    default: {
      throw new Error("Invalid granularity");
    }
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
    default: {
      throw new Error("Invalid interval type");
    }
  }

  return { start, end: roundedNow };
}

function isInTick(
  tick: Date,
  timestamp: number | string | Date,
  granularity: TimeGranularity
): boolean {
  const timestampDate = getDateFromTimestamp(timestamp);
  switch (granularity) {
    case "hour":
      return isSameHour(timestampDate, tick);
    case "month":
      return isSameMonth(timestampDate, tick);
    case "day":
      return isSameDay(timestampDate, tick);
    default: {
      throw new Error("Invalid granularity");
    }
  }
}

export function formatChartDate(
  date: Date,
  granularity: TimeGranularity
): string {
  if (granularity === "hour") {
    return format(date, "HH:mm, MMM d");
  }
  if (granularity === "day") {
    return format(date, "EEE, MMM d");
  }
  if (granularity === "month") {
    return format(date, "MMM y");
  }
  throw new Error("Invalid granularity");
}

export function formatInterval(
  intervalLength: number,
  intervalType: IntervalType
): string {
  return `${intervalLength} ${intervalType}${intervalLength > 1 ? "s" : ""}`;
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
      return matchingData.length > 0 ? matchingData[0] : null;
    default: {
      const _exhaustiveCheck: never = aggregation;
      throw new Error("Unsupported aggregation type");
    }
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
    default: {
      return currentValue;
    }
  }
}

function updateLastValidValue(
  lastValidValues: Map<unknown, number>,
  key: unknown,
  value: unknown
): void {
  if (value) {
    lastValidValues.set(key, Number(value));
  }
}

function findClosestHistoricalValue<T extends DataPoint>(
  data: T[],
  key: keyof T,
  start: string | number | Date
): number {
  if (data.length === 0) {
    return 0;
  }
  const startDate = getDateFromTimestamp(start);
  const closestPoint = data
    .filter((d) => getDateFromTimestamp(d.timestamp) <= startDate)
    .sort(
      (a, b) =>
        getDateFromTimestamp(b.timestamp).getTime() -
        getDateFromTimestamp(a.timestamp).getTime()
    )[0];

  return closestPoint ? Number(closestPoint[key]) : 0;
}
