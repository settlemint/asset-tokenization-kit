import { assetConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getSidebarAssets } from './data';
import { TokenManagementClient } from './token-management-client';

export async function TokenManagement() {
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
        <TokenManagementClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
