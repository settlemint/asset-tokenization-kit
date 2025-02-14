import { type Interval, eachDayOfInterval, eachHourOfInterval, format, subDays, subMonths, subWeeks } from 'date-fns';

type TimeGranularity = 'hour' | 'day';
type IntervalType = 'month' | 'week' | 'day';

interface TimeSeriesOptions {
  granularity: TimeGranularity;
  intervalType: IntervalType;
  intervalLength: number;
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

export function getTimestampMs(timestampMicroseconds: string | number): number {
  return typeof timestampMicroseconds === 'string'
    ? Number(timestampMicroseconds) / 1_000
    : timestampMicroseconds / 1_000;
}

export function formatDay(day: Date): string {
  return format(day, 'EEE, MMM d'); // Eg. Tue, Feb 12
}

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
  const { granularity, intervalType, intervalLength, total = false } = options;

  // Calculate start date based on interval type
  const now = new Date();
  let start: Date;
  switch (intervalType) {
    case 'month':
      start = subMonths(now, intervalLength);
      break;
    case 'week':
      start = subWeeks(now, intervalLength);
      break;
    case 'day':
      start = subDays(now, intervalLength);
      break;
    default:
      throw new Error(`Invalid interval type: ${intervalType}`);
  }

  // Generate ticks based on granularity
  const interval: Interval = { start, end: now };
  const ticks = granularity === 'hour' ? eachHourOfInterval(interval) : eachDayOfInterval(interval);

  // Format timestamp based on granularity
  const formatString = granularity === 'hour' ? 'HH:mm, MMM d' : 'EEE, MMM d';

  // Initialize last valid values for each key
  const lastValidValues = new Map<keyof T, number>();
  for (const key of valueKeys) {
    lastValidValues.set(key, 0);
  }

  return ticks.map((tick) => {
    const startOfPeriod = granularity === 'hour' ? tick.setMinutes(0, 0, 0) : tick.setHours(0, 0, 0, 0);
    const endOfPeriod = granularity === 'hour' ? tick.setMinutes(59, 59, 999) : tick.setHours(23, 59, 59, 999);

    const matchingData = data.find((d) => {
      // Convert microseconds to milliseconds for comparison
      const timestamp = typeof d.timestamp === 'string' ? Number(d.timestamp) / 1_000_000 : d.timestamp / 1_000_000;
      return timestamp >= startOfPeriod / 1000 && timestamp <= endOfPeriod / 1000;
    });

    const result = {
      timestamp: format(tick, formatString),
    } as TimeSeriesResult<Pick<T, keyof T>>;

    // Add each value key to the result
    for (const key of valueKeys) {
      const value = matchingData?.[key];
      if (value !== undefined) {
        lastValidValues.set(key, Number(value));
      }
      const currentValue = total ? (lastValidValues.get(key) ?? 0) : value !== undefined ? Number(value) : 0;
      Object.assign(result, { [key]: currentValue });
    }

    return result;
  });
}
