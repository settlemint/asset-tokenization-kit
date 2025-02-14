import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { getAssetDetailStats } from '../data';
import { TotalSupplyChangedClient } from './total-supply-changed-client';

export async function TotalSupplyChanged({ asset }: { asset: Address }) {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = [`stats-${asset}`];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => getAssetDetailStats(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Supply changes" variant="loading" />}>
        <TotalSupplyChangedClient queryKey={queryKey} asset={asset} />
      </Suspense>
    </HydrationBoundary>
  );
}
