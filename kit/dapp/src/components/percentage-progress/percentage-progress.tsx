import { cn } from "@/lib/utils";
import { FormatPercentage } from "@/lib/utils/format-value/format-percentage";
import * as ProgressPrimitive from "@radix-ui/react-progress";

interface PercentageProgressBarProps {
  percentage: number;
  mode?: "standard" | "inverted";
  warningThreshold?: number;
  errorThreshold?: number;
  label?: string;
}

export function PercentageProgressBar({
  percentage,
  mode = "standard",
  warningThreshold = 75,
  errorThreshold = 90,
  label,
}: PercentageProgressBarProps) {
  const percentageNumber = percentage;

  let rootBgClass = "bg-muted";
  let indicatorBgClass = "bg-muted-foreground";

  if (percentageNumber > 0) {
    rootBgClass = "bg-sm-state-success-background/20";
    indicatorBgClass = "bg-sm-state-success-background";

    if (mode === "standard") {
      if (percentageNumber > errorThreshold) {
        rootBgClass = "bg-destructive/20";
        indicatorBgClass = "bg-destructive";
      } else if (percentageNumber > warningThreshold) {
        rootBgClass = "bg-sm-state-warning-background/20";
        indicatorBgClass = "bg-sm-state-warning-background";
      }
    } else {
      if (percentageNumber < errorThreshold) {
        rootBgClass = "bg-destructive/20";
        indicatorBgClass = "bg-destructive";
      } else if (percentageNumber < warningThreshold) {
        rootBgClass = "bg-sm-state-warning-background/20";
        indicatorBgClass = "bg-sm-state-warning-background";
      }
    }
  }

  return (
    <div className="grid w-full grid-cols-3 items-center">
      <div className="col-span-2">
        <ProgressPrimitive.Root
          data-slot="progress"
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full",
            rootBgClass
          )}
        >
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={cn(
              "h-full w-full flex-1 transition-all",
              indicatorBgClass
            )}
            style={{
              transform: `translateX(-${100 - (percentageNumber || 0)}%)`,
            }}
          />
        </ProgressPrimitive.Root>
      </div>
      <div className="ml-4">
        {label ?? (
          <FormatPercentage
            value={percentage}
            options={{ type: "percentage" }}
          />
        )}
      </div>
    </div>
  );
}
