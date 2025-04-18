import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/number";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import type BigNumber from "bignumber.js";
import { useLocale } from "next-intl";

interface PercentageProgressBarProps {
  percentage: number | BigNumber;
  warningThreshold?: number;
  errorThreshold?: number;
}

export function PercentageProgressBar({
  percentage,
  warningThreshold = 75, // Default warning threshold
  errorThreshold = 90, // Default error threshold
}: PercentageProgressBarProps) {
  const locale = useLocale();
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
              ? "bg-muted"
              : percentageNumber > errorThreshold
                ? "bg-destructive/20"
                : percentageNumber > warningThreshold
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
                : percentageNumber > errorThreshold
                  ? "bg-destructive"
                  : percentageNumber > warningThreshold
                    ? "bg-warning"
                    : "bg-success"
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
