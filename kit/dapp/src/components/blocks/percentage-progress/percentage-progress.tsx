import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils/number';
import type bigDecimal from 'js-big-decimal';
interface PercentageProgressBarProps {
  percentage: number | bigDecimal;
}

export function PercentageProgressBar({
  percentage,
}: PercentageProgressBarProps) {
  const percentageNumber =
    typeof percentage === 'number' ? percentage : Number(percentage.getValue());

  return (
    <div className="grid w-full grid-cols-4 items-center">
      <div className="col-span-3">
        <Progress
          value={percentageNumber}
          className={
            percentageNumber > 80
              ? 'bg-destructive/20'
              : percentageNumber > 50
                ? 'bg-warning/20'
                : 'bg-success/20'
          }
          progressClassName={
            percentageNumber > 80
              ? 'bg-destructive'
              : percentageNumber > 50
                ? 'bg-warning'
                : 'bg-success'
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
