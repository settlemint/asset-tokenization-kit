import { getMyAssets } from '@/components/blocks/my-assets-table/data';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { MyAssetsHeaderClient } from './my-assets-header-client';

export async function MyAssetsHeader() {
  const queryClient = getQueryClient();
  const user = await getAuthenticatedUser();
  const queryKey: QueryKey = queryKeys.user.balances(user.wallet as Address);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getMyAssets(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <MyAssetsHeaderClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
