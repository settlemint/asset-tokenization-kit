import { assetConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getAssetsWidgetData } from '../../common/assets/data';
import { AssetsPieChartSkeleton } from './asset-pie-chart-skeleton';
import { AssetsPieChartClient } from './assets-pie-chart-client';

export async function AssetsPieChart() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = [
    'AssetsPieChart',
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
      <Suspense fallback={<AssetsPieChartSkeleton categories={Object.keys(assetConfig).length} />}>
        <AssetsPieChartClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
