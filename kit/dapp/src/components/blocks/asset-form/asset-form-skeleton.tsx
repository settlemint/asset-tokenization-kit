import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AssetFormSkeletonProps {
  /** The total number of steps in the form */
  totalSteps: number;
  /** Optional minimum height for the form content */
  minHeight?: number;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * A loading skeleton for the asset form that shows a multi-step progress bar
 * and placeholder content.
 */
export function AssetFormSkeleton({ totalSteps, minHeight = 400, className }: AssetFormSkeletonProps) {
  if (totalSteps < 2) {
    return null;
  }

  return (
    <output className={cn('space-y-6', className)} aria-label="Loading asset form">
      <Skeleton className="h-8 w-48" aria-hidden="true" />
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="mb-8 flex gap-2" aria-label={`Form progress: ${totalSteps} steps`}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-1.5 flex-1 animate-pulse rounded-full bg-muted"
                    aria-hidden="true"
                  />
                ))}
              </div>
              {/* Form Content */}
              <div className="grid gap-4" style={{ minHeight: `${minHeight}px` }} aria-hidden="true">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-1/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </output>
  );
}
