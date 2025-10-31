import { cn } from "@/lib/utils";
import type { StatsRangePreset } from "@atk/zod/stats-range";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Props for PercentageChange component
 *
 * Design rationale: Accept raw values rather than pre-calculated percentages
 * to ensure consistency in calculation logic and handle edge cases uniformly.
 */
interface PercentageChangeProps {
  /** Previous value for comparison */
  previousValue: number;
  /** Current value to compare against previous */
  currentValue: number;
  /** Time period for the comparison - determines display format */
  period: StatsRangePreset;
  /** Optional Tailwind classes for custom styling */
  className?: string;
}

/**
 * Percentage change indicator with time period
 *
 * Design philosophy: Self-contained calculation and presentation of value changes
 * over time. Handles all edge cases (zero division, undefined values) internally
 * to prevent errors and provide consistent UX.
 *
 * Visual semantics:
 * - Positive changes: Green with upward trending icon (growth/improvement)
 * - Negative changes: Red with downward trending icon (decline/warning)
 * - Zero/no change: Muted gray, no icon (neutral state)
 *
 * Why we calculate internally rather than accept a percentage:
 * - Ensures consistent rounding and formatting across the app
 * - Centralizes edge case handling (prevents division by zero bugs)
 * - Makes the component API more explicit about data requirements
 *
 * Format examples:
 * - Positive: `↗ +25.0% / 7d` (green)
 * - Negative: `↘ -12.5% / 24h` (red)
 * - Zero: `0.0% / 7d` (muted, no icon)
 *
 * @example
 * ```tsx
 * <PercentageChange
 *   previousValue={100}
 *   currentValue={125}
 *   period="trailing7Days"
 * />
 * // Renders: ↗ +25.0% / 7d (in green)
 * ```
 */
export function PercentageChange({
  previousValue,
  currentValue,
  period,
  className,
}: PercentageChangeProps) {
  const { t } = useTranslation("common");

  /**
   * Calculate percentage change with edge case handling
   *
   * Why handle edge cases explicitly:
   * - Division by zero would crash the component
   * - NaN values propagate through calculations silently
   * - Infinity values break percentage displays
   * - Zero to zero is 0% change (no movement)
   * - Zero to positive/negative is 100% change (from nothing to something)
   */
  const calculatePercentageChange = (): number => {
    // Handle edge cases: division by invalid values
    if (!Number.isFinite(previousValue) || !Number.isFinite(currentValue)) {
      return 0;
    }

    // Both zero: no change
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

  /**
   * Get short period text from translations
   *
   * Why use translations instead of hardcoding:
   * - Japanese and Arabic use different character sets
   * - Some languages may prefer different abbreviation formats
   * - Maintains consistency with the rest of the i18n system
   */
  const getShortPeriodText = (): string => {
    return t(`timePeriods.short.${period}`);
  };

  /**
   * Get full translated period text for accessibility
   */
  const getFullPeriodText = (): string => {
    return t(`timeframes.${period}`);
  };

  /**
   * Determine visual style based on change direction
   *
   * Why three states instead of two:
   * - Positive/negative are semantically different (not just opposites)
   * - Zero change is a distinct state that shouldn't imply direction
   * - Neutral styling for zero prevents false signals
   */
  const isPositive = percentageChange > 0;
  const isNegative = percentageChange < 0;

  const colorClass = isPositive
    ? "text-success"
    : isNegative
      ? "text-destructive"
      : "text-muted-foreground";

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : null;

  /**
   * Format percentage for display
   *
   * Why always show sign for positive: Makes the direction explicit
   * and maintains visual consistency with the icon
   */
  const formattedPercentage = isPositive
    ? `+${percentageChange.toFixed(1)}%`
    : `${percentageChange.toFixed(1)}%`;

  return (
    <div
      className={cn("flex items-center gap-1 text-sm font-medium", className)}
      /**
       * Why include full period text in aria-label:
       * Screen readers should announce the complete context
       * ("up 25 percent over the last 7 days") not just "up 25% / 7d"
       */
      aria-label={`${formattedPercentage} ${getFullPeriodText()}`}
    >
      {/* Icon: Only show for non-zero changes */}
      {Icon && (
        <Icon className={cn("h-4 w-4", colorClass)} aria-hidden="true" />
      )}

      {/* Percentage with color */}
      <span className={colorClass}>{formattedPercentage}</span>

      {/* Separator and period in muted color */}
      <span className="text-muted-foreground"> / {getShortPeriodText()}</span>
    </div>
  );
}
