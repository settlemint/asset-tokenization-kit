import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { getAssetDetailStats } from '../data';
import { TotalVolumeClient } from './total-volume-client';

export async function TotalVolume({ asset }: { asset: Address }) {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = [`stats-${asset}`];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => getAssetDetailStats(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Total volume" variant="loading" />}>
        <TotalVolumeClient queryKey={queryKey} asset={asset} />
      </Suspense>
    </HydrationBoundary>
  );
}
