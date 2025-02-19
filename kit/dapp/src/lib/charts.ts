import {
  type Interval,
  eachDayOfInterval,
  eachHourOfInterval,
  format,
  isSameDay,
  isSameHour,
  isSameMonth,
  startOfDay,
  startOfHour,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { getDateFromTimestamp } from './date';
import { pluralize } from './pluralize';

export type TimeGranularity = 'hour' | 'day' | 'month';
export type IntervalType = 'month' | 'week' | 'day';
export type AggregationType = 'first' | 'sum' | 'count';
export interface TimeSeriesOptions {
  granularity: TimeGranularity;
  intervalType: IntervalType;
  intervalLength: number;
  aggregation: AggregationType;
  total?: boolean;
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
  valueKeys: Array<keyof T>,
  options: TimeSeriesOptions
): TimeSeriesResult<Pick<T, keyof T>>[] {
  const { granularity, intervalType, intervalLength, total = false, aggregation = 'first' } = options;

  // Generate ticks based on granularity
  const interval: Interval = getInterval(granularity, intervalType, intervalLength);
  const ticks = granularity === 'hour' ? eachHourOfInterval(interval) : eachDayOfInterval(interval);

  // Initialize last valid values for each key
  const lastValidValues = new Map<keyof T, number>();
  for (const key of valueKeys) {
    lastValidValues.set(key, 0);
  }

  return ticks.map((tick) => {
    const matchingDataForTick = data.filter((d) => isInTick(tick, d.timestamp, granularity));
    const aggregatedData = aggregateData(matchingDataForTick, valueKeys, aggregation);

    const result = {
      timestamp: formatDate(tick, granularity),
    } as TimeSeriesResult<Pick<T, keyof T>>;

    for (const key of valueKeys) {
      const processedValue = processTimeSeriesValue(
        Number(aggregatedData?.[key]),
        lastValidValues.get(key) ?? 0,
        total
      );

      updateLastValidValue(lastValidValues, key, processedValue);
      Object.assign(result, { [key]: processedValue });
    }

    return result;
  });
}

export function getInterval(
  granularity: TimeGranularity,
  intervalType: IntervalType,
  intervalLength: number
): Interval<Date> {
  const now = new Date();

  // First round the current time based on granularity
  const roundedNow = granularity === 'hour' ? startOfHour(now) : startOfDay(now);

  let start: Date;
  switch (intervalType) {
    case 'month':
      start = subMonths(roundedNow, intervalLength);
      break;
    case 'week':
      start = subWeeks(roundedNow, intervalLength);
      break;
    case 'day':
      start = subDays(roundedNow, intervalLength);
      break;
    default:
      throw new Error(`Invalid interval type: ${intervalType}`);
  }

  return { start, end: roundedNow };
}

function isInTick(tick: Date, timestamp: number | string | Date, granularity: TimeGranularity): boolean {
  const timestampDate = getDateFromTimestamp(timestamp);
  switch (granularity) {
    case 'hour':
      return isSameHour(timestampDate, tick);
    case 'month':
      return isSameMonth(timestampDate, tick);
    case 'day':
      return isSameDay(timestampDate, tick);
    default: {
      const _exhaustiveCheck: never = granularity;
      throw new Error(`Invalid granularity: ${_exhaustiveCheck}`);
    }
  }
}

function formatDate(date: Date, granularity: TimeGranularity): string {
  return format(date, granularity === 'hour' ? 'HH:mm, MMM d' : 'EEE, MMM d'); // Eg. Tue, Feb 12
}

export function formatInterval(intervalLength: number, intervalType: IntervalType): string {
  return `${intervalLength} ${pluralize(intervalLength, intervalType)}`;
}

function aggregateData<T extends DataPoint>(
  matchingData: T[],
  valueKeys: Array<keyof T>,
  aggregation: AggregationType
): Record<keyof T, unknown> | null {
  switch (aggregation) {
    case 'sum':
      return valueKeys.reduce(
        (acc, key) => {
          const sum = matchingData.reduce((sum, d) => sum + Number(d[key]), 0);
          acc[key] = sum;
          return acc;
        },
        {} as Record<keyof T, number>
      );
    case 'count':
      return valueKeys.reduce(
        (acc, key) => {
          acc[key] = matchingData.length;
          return acc;
        },
        {} as Record<keyof T, number>
      );
    case 'first':
      return matchingData.length > 0 ? matchingData[0] : null;
    default: {
      const _exhaustiveCheck: never = aggregation;
      throw new Error(`Unsupported aggregation type: ${_exhaustiveCheck}`);
    }
  }
}

function processTimeSeriesValue(currentValue: number | null, lastValidValue: number, isTotal: boolean): number {
  if (!currentValue) {
    return isTotal ? lastValidValue : 0;
  }

  return isTotal ? currentValue + lastValidValue : currentValue;
}

function updateLastValidValue(lastValidValues: Map<unknown, number>, key: unknown, value: unknown): void {
  if (value) {
    lastValidValues.set(key, Number(value));
  }
}
