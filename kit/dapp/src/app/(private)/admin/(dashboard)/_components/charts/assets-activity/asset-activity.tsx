import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { AssetActivityClient } from './asset-activity-client';
import { getAssetsEventsData } from './data';

export async function AssetActivity() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = ['AssetActivity'];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getAssetsEventsData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Activity" variant="loading" />}>
        <AssetActivityClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
