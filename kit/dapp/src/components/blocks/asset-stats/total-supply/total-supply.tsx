import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { getAssetDetailStats } from '../data';
import { TotalSupplyClient } from './total-supply-client';

interface TotalSupplyProps {
  asset: Address;
}

export async function TotalSupply({ asset }: TotalSupplyProps) {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.assets.stats.supply(asset);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getAssetDetailStats(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Total supply" variant="loading" />}>
        <TotalSupplyClient queryKey={queryKey} asset={asset} />
      </Suspense>
    </HydrationBoundary>
  );
}
