import { columns } from '@/app/(private)/admin/stablecoins/(table)/_components/columns';
import { AssetTableSkeleton } from '@/components/blocks/asset-table/asset-table-skeleton';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getAssetEvents } from './data';
import { LatestEventsClient } from './latest-events-client';

export default async function LatestEvents() {
  const queryClient = getQueryClient();
  const queryKey = ['assetEvents'];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getAssetEvents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={columns.length} />}>
        <LatestEventsClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
