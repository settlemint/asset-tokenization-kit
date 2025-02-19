import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { AssetManagementClient } from './asset-management-client';
import { getSidebarAssets } from './data';

export async function AssetManagement() {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.asset.sidebar();
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getSidebarAssets,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AssetManagementClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
