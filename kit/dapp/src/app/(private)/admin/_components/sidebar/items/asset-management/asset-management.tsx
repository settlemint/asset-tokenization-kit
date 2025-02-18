import { assetsSidebarQueryKey } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { AssetManagementClient } from './asset-management-client';
import { getSidebarAssets } from './data';

export async function AssetManagement() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: assetsSidebarQueryKey,
    queryFn: getSidebarAssets,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AssetManagementClient queryKey={assetsSidebarQueryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
