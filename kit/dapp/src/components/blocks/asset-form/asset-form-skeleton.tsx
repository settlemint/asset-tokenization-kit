import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AssetFormSkeleton({ totalSteps }: { totalSteps: number }) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <div className="space-y-6">
              <div className="mb-8 flex gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div key={index} className="h-1.5 flex-1 rounded-full bg-muted" />
                ))}
              </div>
              <div className="min-h-[400px]">
                <Skeleton className="h-[400px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
