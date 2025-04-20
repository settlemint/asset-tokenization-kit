import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/number";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import type BigNumber from "bignumber.js";
import { useLocale } from "next-intl";

interface PercentageProgressBarProps {
  percentage: number | BigNumber;
  mode?: "standard" | "inverted";
  warningThreshold?: number;
  errorThreshold?: number;
}

export function PercentageProgressBar({
  percentage,
  mode = "standard",
  warningThreshold = 75,
  errorThreshold = 90,
}: PercentageProgressBarProps) {
  const locale = useLocale();
  const percentageNumber =
    typeof percentage === "number" ? percentage : Number(percentage.toString());

  let rootBgClass = "bg-muted";
  let indicatorBgClass = "bg-muted-foreground";

  if (percentageNumber > 0) {
    rootBgClass = "bg-success/20";
    indicatorBgClass = "bg-success";

    if (mode === "standard") {
      if (percentageNumber > errorThreshold) {
        rootBgClass = "bg-destructive/20";
        indicatorBgClass = "bg-destructive";
      } else if (percentageNumber > warningThreshold) {
        rootBgClass = "bg-warning/20";
        indicatorBgClass = "bg-warning";
      }
    } else {
      if (percentageNumber < errorThreshold) {
        rootBgClass = "bg-destructive/20";
        indicatorBgClass = "bg-destructive";
      } else if (percentageNumber < warningThreshold) {
        rootBgClass = "bg-warning/20";
        indicatorBgClass = "bg-warning";
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
        {formatNumber(percentage, {
          percentage: true,
          locale: locale,
        })}
      </div>
    </div>
  );
}
