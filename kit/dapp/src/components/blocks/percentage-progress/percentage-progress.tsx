import { Progress } from '@/components/ui/progress';
interface PercentageProgressBarProps {
  percentage: number;
}

export function PercentageProgressBar({ percentage }: PercentageProgressBarProps) {
  return (
    <div className="grid w-full grid-cols-4 items-center">
      <div className="col-span-3">
        <Progress
          value={percentage}
          className={percentage < 50 ? 'bg-destructive/20' : percentage < 80 ? 'bg-warning/20' : 'bg-success/20'}
          progressClassName={percentage < 50 ? 'bg-destructive' : percentage < 80 ? 'bg-warning' : 'bg-success'}
        />
      </div>
      <div className="text-right">{percentage}%</div>
    </div>
  );
}
