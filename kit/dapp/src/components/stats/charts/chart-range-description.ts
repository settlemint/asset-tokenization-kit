import type {
  StatsRangeInterval,
  StatsResolvedRange,
} from "@atk/zod/stats-range";
import { differenceInDays, differenceInHours, format } from "date-fns";
import type { TFunction } from "i18next";

interface BuildDescriptionOptions {
  range: StatsResolvedRange;
  t: TFunction<"stats">;
}

const INTERVAL_DATE_FORMAT: Record<StatsRangeInterval, string> = {
  day: "MMM dd",
  hour: "MMM dd HH:mm",
};

/**
 * Builds a description of the chart range.
 * @param options - The options for building the description.
 * @returns The description of the chart range.
 * @example
 * ```typescript
 * buildChartRangeDescription({ range: { interval: "hour", from: new Date(), to: new Date() }, t: t });
 * // Returns: over the last 1 hour
 * ```
 */
export function buildChartRangeDescription({
  range,
  t,
}: BuildDescriptionOptions): string {
  const { from, to } = range;
  const difference =
    range.interval === "hour"
      ? differenceInHours(to, from)
      : differenceInDays(to, from);
  const count = Math.max(1, difference);
  const unit = t(`charts.common.units.${range.interval}`, { count });

  if (range.isPreset) {
    return t("charts.common.range.duration", { duration: unit });
  }

  const start = format(from, INTERVAL_DATE_FORMAT[range.interval]);
  const end = format(to, INTERVAL_DATE_FORMAT[range.interval]);

  return t("charts.common.range.window", { start, end });
}
