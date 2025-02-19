import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { AssetManagementClient } from './asset-management-client';
import { getSidebarAssets } from './data';

export async function AssetManagement() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.assets.root,
    queryFn: getSidebarAssets,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AssetManagementClient queryKey={queryKeys.assets.root} />
      </Suspense>
    </HydrationBoundary>
  );
}
