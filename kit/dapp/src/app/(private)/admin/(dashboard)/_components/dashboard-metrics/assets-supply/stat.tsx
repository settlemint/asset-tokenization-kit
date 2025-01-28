import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getAssetsSupplyData } from './data';
import { AssetTotalSupplyStatClient } from './stat-client';
export const ASSETS_SUPPLY_QUERY_KEY = 'assets-supply';
export async function AssetTotalSupplyStat({ refetchInterval }: { refetchInterval: number }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [ASSETS_SUPPLY_QUERY_KEY],
    queryFn: () => getAssetsSupplyData(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AssetTotalSupplyStatClient
          refetchInterval={refetchInterval}
          dataAction={getAssetsSupplyData}
          queryKey={ASSETS_SUPPLY_QUERY_KEY}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
