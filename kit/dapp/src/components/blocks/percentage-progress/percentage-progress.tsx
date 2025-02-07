import { Progress } from '@/components/ui/progress';
interface PercentageProgressBarProps {
  percentage: number;
}

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

export function PercentageProgressBar({ percentage }: PercentageProgressBarProps) {
  return (
    <div className="grid w-full grid-cols-4 items-center">
      <div className="col-span-3">
        <Progress value={percentage} className={getColor(percentage, 20)} progressClassName={getColor(percentage)} />
      </div>
      <div className="text-right">{percentage}%</div>
    </div>
  );
}
