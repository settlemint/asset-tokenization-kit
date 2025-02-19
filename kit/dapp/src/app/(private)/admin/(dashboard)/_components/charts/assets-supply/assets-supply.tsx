import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { allAssetQueryKeys } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getAssetsWidgetData } from '../../common/assets/data';
import { AssetsSupplyClient } from './assets-supply-client';

export async function AssetsSupply() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = ['AssetsSupply', ...allAssetQueryKeys];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getAssetsWidgetData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Distribution" variant="loading" />}>
        <AssetsSupplyClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
