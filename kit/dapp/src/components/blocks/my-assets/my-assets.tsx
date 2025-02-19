import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { getMyAssets } from './data';
import { MyAssetsTableClient } from './my-assets-client';

export async function MyAssetsTable() {
  const queryClient = getQueryClient();
  const user = await getAuthenticatedUser();
  const queryKey = queryKeys.user.balances(user.wallet as Address);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getMyAssets,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <MyAssetsTableClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
