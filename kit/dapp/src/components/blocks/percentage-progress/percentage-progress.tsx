import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils/number";
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
    <div className="grid w-full grid-cols-4 items-center">
      <div className="col-span-3">
        <Progress
          value={percentageNumber}
          className={
            percentageNumber > 80
              ? "bg-destructive/20"
              : percentageNumber > 50
                ? "bg-warning/20"
                : "bg-success/20"
          }
        />
      </div>
      <div className="text-right">
        {formatNumber(percentage, {
          percentage: true,
        })}
      </div>
    </div>
  );
}
