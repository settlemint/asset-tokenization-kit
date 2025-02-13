import { assetConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getAssetsWidgetData } from '../../common/assets/data';
import { AssetsSupplySkeleton } from './assets-supply-chart-skeleton';
import { AssetsSupplyClient } from './assets-supply-client';

export async function AssetsSupply() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = [
    'AssetsSupply',
    assetConfig.bond.queryKey,
    assetConfig.cryptocurrency.queryKey,
    assetConfig.equity.queryKey,
    assetConfig.fund.queryKey,
    assetConfig.stablecoin.queryKey,
  ];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getAssetsWidgetData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetsSupplySkeleton />}>
        <AssetsSupplyClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
