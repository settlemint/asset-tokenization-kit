import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { AssetActivitySkeleton } from './asset-activity-chart-skeleton';
import { AssetActivityClient } from './asset-activity-client';
import { getAssetsEventsData } from './data';

export async function AssetActivity() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = ['EventsBarChart'];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getAssetsEventsData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetActivitySkeleton />}>
        <AssetActivityClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
