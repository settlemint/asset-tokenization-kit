import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatTimeUntilNextUpdate,
  getChartLastUpdateTime,
  getChartNextUpdateTime,
} from "@/lib/utils/chart-update-time";
import { Clock } from "lucide-react";

interface ChartUpdateInfoProps {
  interval: "hour" | "day";
  className?: string;
}

/**
 * Chart Update Info Component
 *
 * Displays a clock icon with tooltip showing when the chart was last updated.
 * Calculates update time based on the chart interval:
 * - Hour interval: Shows last update at start of current hour
 * - Day interval: Shows last update at start of current day
 *
 * Designed to be reusable across all chart components.
 */
export function ChartUpdateInfo({
  interval,
  className = "",
}: ChartUpdateInfoProps) {
  const lastUpdateTime = getChartLastUpdateTime(interval);
  const nextUpdateTime = getChartNextUpdateTime(interval);
  const nextUpdateText = formatTimeUntilNextUpdate(nextUpdateTime, interval);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
            aria-label="Chart update information"
          >
            <Clock className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-sm font-medium">{nextUpdateText}</p>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdateTime.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Next update: {nextUpdateTime.toLocaleString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
