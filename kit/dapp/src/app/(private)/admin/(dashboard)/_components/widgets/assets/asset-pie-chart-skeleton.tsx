import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const containerVariants = cva('mx-auto flex aspect-square max-h-[300px] items-center justify-center', {
  variants: {
    variant: {
      loading: '',
      noData: '',
    },
  },
  defaultVariants: {
    variant: 'loading',
  },
});

const circleVariants = cva('flex h-[80%] w-[80%] items-center justify-center', {
  variants: {
    variant: {
      loading: 'animate-pulse rounded-full bg-muted',
      noData: 'flex items-center justify-center rounded-full bg-muted/50',
    },
  },
  defaultVariants: {
    variant: 'loading',
  },
});

interface AssetsPieChartSkeletonProps extends VariantProps<typeof circleVariants> {}

export function AssetsPieChartSkeleton({ variant = 'loading' }: AssetsPieChartSkeletonProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Asset Distribution (in %)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className={containerVariants({ variant })}>
          <div className={circleVariants({ variant })}>
            {variant === 'noData' && <span className="text-muted-foreground text-sm">No data available</span>}
          </div>
        </div>
        {variant === 'loading' && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex basis-1/4 items-center justify-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
