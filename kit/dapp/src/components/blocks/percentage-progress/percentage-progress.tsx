import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
interface PercentageProgressBarProps {
  percentage: number;
}

export function PercentageProgressBar({ percentage }: PercentageProgressBarProps) {
  // Ensure the percentage is between 0 and 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Determine the color based on the percentage
  const getColor = (percent: number, alpha?: number) => {
    if (percent < 50) {
      return `bg-destructive${alpha ? `/${alpha}` : ''}`;
    }
    if (percent < 80) {
      return `bg-warning${alpha ? `/${alpha}` : ''}`;
    }
    return `bg-success${alpha ? `/${alpha}` : ''}`;
  };

  return (
    <div className="grid w-full grid-cols-4 items-center">
      <div className="col-span-3">
        <Progress
          value={clampedPercentage}
          className={cn(getColor(clampedPercentage, 20))}
          progressClassName={getColor(clampedPercentage)}
        />
      </div>
      <div className="text-right">{clampedPercentage}%</div>
    </div>
  );
}
