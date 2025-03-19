export const SECONDS_PER_DAY = 86400;

export const IntervalPeriod = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
  Quarterly: "quarterly",
  SemiAnnually: "semi-annually",
  Annually: "annually",
} as const;

export type IntervalPeriod = typeof IntervalPeriod[keyof typeof IntervalPeriod];

type IntervalTranslationKey = `interval.options.${IntervalPeriod}`;

/**
 * Gets the translation key for an interval period
 * @param interval - The interval period
 * @param t - The translation function from next-intl
 * @returns The translated label for the interval
 */
export const getIntervalLabel = (
  interval: IntervalPeriod,
  t: (key: IntervalTranslationKey) => string
): string => {
  return t(`interval.options.${interval}`);
};

/**
 * Converts a percentage value to basis points
 * @param percentage - A number between 0 and 100
 * @returns A string representing the basis points (1 basis point = 0.01%)
 * @example
 * percentageToBasisPoints(5) // returns "500" (5% = 500 basis points)
 */
export const percentageToBasisPoints = (percentage: number): string => {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100");
  }
  return Math.round(percentage * 100).toString();
};

/**
 * Converts basis points to a percentage value
 * @param basisPoints - A string representing basis points
 * @returns A number representing the percentage
 * @example
 * basisPointsToPercentage("500") // returns 5 (500 basis points = 5%)
 */
export const basisPointsToPercentage = (basisPoints: string): number => {
  return Number(basisPoints) / 100;
};

/**
 * Converts an interval period to seconds
 * @param interval - The interval period to convert
 * @returns A string representing the number of seconds
 * @example
 * intervalToSeconds("monthly") // returns "2592000"
 */
export const intervalToSeconds = (interval: IntervalPeriod): string => {
  const conversions: Record<IntervalPeriod, number> = {
    [IntervalPeriod.Daily]: SECONDS_PER_DAY,
    [IntervalPeriod.Weekly]: SECONDS_PER_DAY * 7,
    [IntervalPeriod.Monthly]: SECONDS_PER_DAY * 30,
    [IntervalPeriod.Quarterly]: SECONDS_PER_DAY * 90,
    [IntervalPeriod.SemiAnnually]: SECONDS_PER_DAY * 180,
    [IntervalPeriod.Annually]: SECONDS_PER_DAY * 365,
  };
  return conversions[interval].toString();
};

/**
 * Converts seconds to an interval period
 * @param seconds - A string representing the number of seconds
 * @returns The corresponding interval period or null if no exact match
 * @example
 * secondsToInterval("2592000") // returns "monthly"
 */
export const secondsToInterval = (seconds: string): IntervalPeriod | null => {
  const secondsNum = Number(seconds);
  const conversions: Record<number, IntervalPeriod> = {
    [SECONDS_PER_DAY]: IntervalPeriod.Daily,
    [SECONDS_PER_DAY * 7]: IntervalPeriod.Weekly,
    [SECONDS_PER_DAY * 30]: IntervalPeriod.Monthly,
    [SECONDS_PER_DAY * 90]: IntervalPeriod.Quarterly,
    [SECONDS_PER_DAY * 180]: IntervalPeriod.SemiAnnually,
    [SECONDS_PER_DAY * 365]: IntervalPeriod.Annually,
  };
  return conversions[secondsNum] || null;
};