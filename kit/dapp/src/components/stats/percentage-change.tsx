import { cn } from "@/lib/utils";
import type { StatsRangePreset } from "@atk/zod/stats-range";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Props for PercentageChange component
 *
 * Accepts nullable values and returns null when data is unavailable.
 */
interface PercentageChangeProps {
  previousValue: number | null | undefined;
  currentValue: number | null | undefined;
  period: StatsRangePreset;
  className?: string;
}

/**
 * Percentage change indicator with time period. Returns null when data is unavailable.
 *
 * Output format:
 * - Positive: `↗ +25.0% / 7d` (green with TrendingUp icon)
 * - Negative: `↘ -12.5% / 24h` (red with TrendingDown icon)
 * - Zero: `0.0% / 7d` (muted, no icon)
 *
 * @example
 * <PercentageChange
 *   previousValue={stats[0]?.value}
 *   currentValue={stats.at(-1)?.value}
 *   period="trailing7Days"
 * />
 */
export function PercentageChange({
  previousValue,
  currentValue,
  period,
  className,
}: PercentageChangeProps) {
  const { t } = useTranslation("common");

  if (
    previousValue == null ||
    currentValue == null ||
    !Number.isFinite(previousValue) ||
    !Number.isFinite(currentValue)
  ) {
    return null;
  }

  const calculatePercentageChange = (): number => {
    if (previousValue === 0 && currentValue === 0) {
      return 0;
    }

    // Previous zero but current non-zero: 100% increase/decrease
    if (previousValue === 0) {
      return currentValue > 0 ? 100 : -100;
    }

    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const percentageChange = calculatePercentageChange();
  const getShortPeriodText = (): string => t(`timePeriods.short.${period}`);
  const getFullPeriodText = (): string => t(`timeframes.${period}`);

  const isPositive = percentageChange > 0;
  const isNegative = percentageChange < 0;

  const colorClass = isPositive
    ? "text-success"
    : isNegative
      ? "text-destructive"
      : "text-muted-foreground";

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : null;

  const formattedPercentage = isPositive
    ? `+${percentageChange.toFixed(1)}%`
    : `${percentageChange.toFixed(1)}%`;

  return (
    <div
      className={cn("flex items-center gap-1 text-sm font-medium", className)}
      aria-label={`${formattedPercentage} ${getFullPeriodText()}`}
    >
      {Icon && (
        <Icon className={cn("h-4 w-4", colorClass)} aria-hidden="true" />
      )}
      <span className={colorClass}>{formattedPercentage}</span>
      <span className="text-muted-foreground"> / {getShortPeriodText()}</span>
    </div>
  );
}
