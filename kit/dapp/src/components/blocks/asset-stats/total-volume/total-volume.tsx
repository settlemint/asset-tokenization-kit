import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { getAssetDetailStats } from '../data';
import { TotalVolumeClient } from './total-volume-client';

interface TotalVolumeProps {
  asset: Address;
}

export async function TotalVolume({ asset }: TotalVolumeProps) {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.assets.stats.volume(asset);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getAssetDetailStats(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <TotalVolumeClient queryKey={queryKey} asset={asset} />
      </Suspense>
    </HydrationBoundary>
  );
}
