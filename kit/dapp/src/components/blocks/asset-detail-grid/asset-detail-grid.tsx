import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { cn } from '@/lib/utils';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { type PropsWithChildren, Suspense } from 'react';
import type { Address } from 'viem';

function AssetDetailGridSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('py-4', className)}>
      <CardContent className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export interface AssetDetailGridProps<Asset extends Record<string, unknown>> {
  asset: Address;
  assetConfig: AssetDetailConfig;
  /** Function to fetch the asset data */
  dataAction: (asset: Address) => Promise<Asset>;
  className?: string;
}

/**
 * Grid component for displaying asset details.
 * Note: Child components should implement their own Suspense boundaries for optimal loading states.
 */
export async function AssetDetailGrid<Asset extends Record<string, unknown>>({
  asset,
  assetConfig,
  dataAction,
  children,
  className,
}: PropsWithChildren<AssetDetailGridProps<Asset>>) {
  const queryClient = getQueryClient();
  const queryKey = [...assetConfig.queryKey, asset];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => dataAction(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetDetailGridSkeleton className={className} />}>
        <Card className={cn('py-4', className)}>
          <CardContent className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {children}
          </CardContent>
        </Card>
      </Suspense>
    </HydrationBoundary>
  );
}
