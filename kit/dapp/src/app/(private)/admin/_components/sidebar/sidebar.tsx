import { assetConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getSidebarAssets } from './data';
import { SidebarClient } from './sidebar-client';

export async function Sidebar() {
  const queryClient = getQueryClient();
  const queryKey = [
    assetConfig.bond.queryKey,
    assetConfig.equity.queryKey,
    assetConfig.fund.queryKey,
    assetConfig.stablecoin.queryKey,
    assetConfig.cryptocurrency.queryKey,
  ];

  await queryClient.prefetchQuery({
    queryKey: queryKey,
    queryFn: getSidebarAssets,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <SidebarClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
