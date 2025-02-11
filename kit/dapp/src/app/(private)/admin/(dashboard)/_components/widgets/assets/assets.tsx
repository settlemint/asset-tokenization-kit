import { assetConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getAssetsWidgetData } from '../../common/assets/data';
import { AssetsWidgetClient } from './assets-client';

export async function AssetsWidget() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = [
    'AssetsWidget',
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
      <Suspense>
        <AssetsWidgetClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
