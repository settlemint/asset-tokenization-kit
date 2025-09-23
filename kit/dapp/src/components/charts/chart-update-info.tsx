import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChartUpdateTime } from "@/hooks/use-chart-update-time";
import { formatValue } from "@/lib/utils/format-value";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");
  const { getChartUpdateInfo } = useChartUpdateTime();
  const { lastUpdate, nextUpdate, timeUntilUpdate } =
    getChartUpdateInfo(interval);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
            aria-label={t("chart.update.info")}
          >
            <Clock className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {timeUntilUpdate}
            </p>
            <p className="text-xs text-foreground/80">
              {t("chart.update.lastUpdated")}:{" "}
              {formatValue(lastUpdate, {
                type: "date",
                dateOptions: { includeTime: true },
                className: "text-xs",
              })}
            </p>
            <p className="text-xs text-foreground/80">
              {t("chart.update.nextUpdate")}:{" "}
              {formatValue(nextUpdate, {
                type: "date",
                dateOptions: { includeTime: true },
                className: "text-xs",
              })}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
