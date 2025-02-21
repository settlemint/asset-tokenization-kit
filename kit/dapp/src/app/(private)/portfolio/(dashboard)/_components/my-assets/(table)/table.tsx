import { getMyAssets } from '@/app/(private)/portfolio/_components/data';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { SmallMyAssetsTableClient } from './table-client';

export async function MyAssets() {
  const user = await getAuthenticatedUser();
  const queryKey = queryKeys.user.balances(user.wallet as Address);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getMyAssets({ active: true, wallet: user.wallet as Address }),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <SmallMyAssetsTableClient queryKey={queryKey} wallet={user.wallet as Address} />
      </Suspense>
    </HydrationBoundary>
  );
}
