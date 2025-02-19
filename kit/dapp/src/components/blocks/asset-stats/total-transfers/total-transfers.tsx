import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { useQueryKeys } from '@/hooks/use-query-keys';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { getAssetDetailStats } from '../data';
import { TotalTransfersClient } from './total-transfers-client';

interface TotalTransfersProps {
  asset: Address;
}

export async function TotalTransfers({ asset }: TotalTransfersProps) {
  const queryClient = getQueryClient();
  const { keys } = useQueryKeys();
  const queryKey = keys.assets.stats.transfers(asset);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getAssetDetailStats(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Total transfers" variant="loading" />}>
        <TotalTransfersClient queryKey={queryKey} asset={asset} />
      </Suspense>
    </HydrationBoundary>
  );
}
