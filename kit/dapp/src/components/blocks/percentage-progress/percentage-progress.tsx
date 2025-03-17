import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/number";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { BigNumber } from "bignumber.js";
interface PercentageProgressBarProps {
  percentage: number | BigNumber;
}

export function PercentageProgressBar({
  percentage,
}: PercentageProgressBarProps) {
  const percentageNumber =
    typeof percentage === "number" ? percentage : Number(percentage.toString());

  return (
    <div className="grid w-full grid-cols-3 items-center">
      <div className="col-span-2">
        <ProgressPrimitive.Root
          data-slot="progress"
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full",
            percentageNumber === 0
              ? "bg-background/20"
              : percentageNumber > 90
                ? "bg-destructive/20"
                : percentageNumber > 75
                  ? "bg-warning/20"
                  : "bg-success/20"
          )}
        >
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={cn(
              "h-full w-full flex-1 bg-primary transition-all",
              percentageNumber === 0
                ? "bg-primary"
                : percentageNumber > 90
                  ? "bg-destructive"
                  : percentageNumber > 75
                    ? "bg-warning"
                    : "bg-success"
            )}
            style={{
              transform: `translateX(-${100 - (percentageNumber || 0)}%)`,
            }}
          />
        </ProgressPrimitive.Root>
      </div>
      <div className="mr-4 text-right">
        {formatNumber(percentage, {
          percentage: true,
        })}
      </div>
    </div>
  );
}
