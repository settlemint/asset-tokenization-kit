import {
  type Interval,
  eachDayOfInterval,
  eachHourOfInterval,
  format,
  isSameDay,
  parse,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

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

  const now = new Date();
  let start: Date;

  // First round the current time based on granularity
  const roundedNow = granularity === 'hour' ? startOfHour(now) : startOfDay(now);

  switch (intervalType) {
    case 'month':
      start = startOfMonth(subMonths(roundedNow, intervalLength));
      break;
    case 'week':
      start = startOfWeek(subWeeks(roundedNow, intervalLength));
      break;
    case 'day':
      start = startOfDay(subDays(roundedNow, intervalLength));
      break;
    default:
      throw new Error(`Invalid interval type: ${intervalType}`);
  }

  // Generate ticks based on granularity
  const interval: Interval = { start, end: roundedNow };
  const ticks = granularity === 'hour' ? eachHourOfInterval(interval) : eachDayOfInterval(interval);

  // Initialize last valid values for each key
  const lastValidValues = new Map<keyof T, number>();
  for (const key of valueKeys) {
    lastValidValues.set(key, 0);
  }

  return ticks.map((tick) => {
    const matchingData = data.find((d) => {
      const timestamp = getDateFromMicroseconds(d.timestamp);
      return isSameDay(timestamp, tick);
    });

    const result = {
      timestamp: formatDate(tick, granularity),
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

function getDateFromMicroseconds(timestampMicroseconds: string | number): Date {
  return parse((Number(timestampMicroseconds) / 1000).toString(), 'T', new Date());
}

function formatDate(date: Date, granularity: TimeGranularity): string {
  return format(date, granularity === 'hour' ? 'HH:mm, MMM d' : 'EEE, MMM d'); // Eg. Tue, Feb 12
}
