import {
  type Interval,
  eachDayOfInterval,
  eachHourOfInterval,
  format,
  isSameDay,
  isSameHour,
  isSameMonth,
  parse,
  startOfDay,
  startOfHour,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

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
  timestamp: number | string;
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

  const now = new Date();

  // First round the current time based on granularity
  const roundedNow = granularity === 'hour' ? startOfHour(now) : startOfDay(now);
  const start = startOfInterval(roundedNow, intervalType, intervalLength);

  // Generate ticks based on granularity
  const interval: Interval = { start, end: roundedNow };
  const ticks = granularity === 'hour' ? eachHourOfInterval(interval) : eachDayOfInterval(interval);

  // Initialize last valid values for each key
  const lastValidValues = new Map<keyof T, number>();
  for (const key of valueKeys) {
    lastValidValues.set(key, 0);
  }

  return ticks.map((tick) => {
    const matchingDataForTick = data.filter((d) => {
      const timestamp = getDateFromMicroseconds(d.timestamp);
      return granularity === 'hour'
        ? isSameHour(timestamp, tick)
        : granularity === 'month'
          ? isSameMonth(timestamp, tick)
          : isSameDay(timestamp, tick);
    });

    const aggregatedData = aggregateData(matchingDataForTick, valueKeys, aggregation);

    const result = {
      timestamp: formatDate(tick, granularity),
    } as TimeSeriesResult<Pick<T, keyof T>>;

    // Add each value key to the result
    for (const key of valueKeys) {
      const value = aggregatedData?.[key];
      if (value !== undefined) {
        lastValidValues.set(key, Number(value));
      }
      const currentValue = total ? (lastValidValues.get(key) ?? 0) : value !== undefined ? Number(value) : 0;
      Object.assign(result, { [key]: currentValue });
    }

    return result;
  });
}

export function startOfInterval(date: Date, intervalType: IntervalType, intervalLength: number): Date {
  switch (intervalType) {
    case 'month':
      return subMonths(date, intervalLength);
    case 'week':
      return subWeeks(date, intervalLength);
    case 'day':
      return subDays(date, intervalLength);
    default:
      throw new Error(`Invalid interval type: ${intervalType}`);
  }
}

function getDateFromMicroseconds(timestampMicroseconds: string | number): Date {
  return parse((Number(timestampMicroseconds) / 1000).toString(), 'T', new Date());
}

function formatDate(date: Date, granularity: TimeGranularity): string {
  return format(date, granularity === 'hour' ? 'HH:mm, MMM d' : 'EEE, MMM d'); // Eg. Tue, Feb 12
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
