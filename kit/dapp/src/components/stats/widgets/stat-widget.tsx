import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  className?: string;
  /** Previous period value for trend calculation */
  previousValue?: number;
  /** Current period value for trend calculation */
  currentValue?: number;
  /** Translation key for period label */
  period?: "fromLastWeek" | "fromLastMonth" | "fromLastYear";
}

// Calculate percentage change, returns null if previous is 0 or values are missing
function calculatePercentageChange(
  previous: number | undefined,
  current: number | undefined
): number | null {
  if (previous === undefined || current === undefined || previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// Map change to theme colors: positive=success, negative=destructive, zero=muted
function getTrendColor(change: number): string {
  if (change > 0) return "text-success";
  if (change < 0) return "text-destructive";
  return "text-muted-foreground";
}

// Format percentage with sign: +23.5%, -12.8%, or 0%
function formatPercentageChange(change: number): string {
  if (change > 0) return `+${change}%`;
  if (change < 0) return `${change}%`;
  return "0%";
}

// Format absolute difference with sign: +250, -50, or 0
function formatAbsoluteDifference(change: number | null): string | null {
  if (change === null) return null;
  if (change > 0) return `+${Math.abs(change)}`;
  if (change < 0) return `${Math.abs(change)}`;
  return "0";
}

// Stat card with optional trend indicators (percentage in header, absolute difference in footer)
export function StatCard({
  title,
  value,
  icon: Icon,
  className,
  previousValue,
  currentValue,
  period,
}: StatCardProps) {
  const { t } = useTranslation("stats");

  const percentageChange = calculatePercentageChange(
    previousValue,
    currentValue
  );
  // Check !== undefined instead of truthy to handle zero values correctly
  const change =
    currentValue !== undefined && previousValue !== undefined
      ? currentValue - previousValue
      : null;
  const absoluteDifference = formatAbsoluteDifference(change);

  const periodText = period ? t(period) : "";

  return (
    <Card className={cn("", className)}>
      <CardContent className="flex flex-col space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </div>
          {percentageChange && (
            <span
              className={cn(
                "font-medium tabular-nums",
                getTrendColor(percentageChange)
              )}
            >
              {formatPercentageChange(percentageChange)}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {/* Check !== null instead of truthy to show "0" when change is zero */}
        {absoluteDifference !== null && (
          <div
            className={cn(
              "text-sm tabular-nums",
              getTrendColor(change as number)
            )}
          >
            {absoluteDifference} {periodText}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
