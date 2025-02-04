import { getAssetsWidgetData } from '@/app/(private)/admin/(dashboard)/_components/widgets/assets/data';
import { getQueryClient } from '@/lib/react-query';
import { TokenType } from '@/types/token-types';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { AssetsWidgetClient } from './assets-client';

export async function AssetsWidget() {
  const queryClient = getQueryClient();
  const queryKey = [TokenType.Stablecoin, TokenType.Bond, TokenType.Equity, TokenType.Cryptocurrency, TokenType.Fund];

  await queryClient.prefetchQuery({
    queryKey: queryKey,
    queryFn: getAssetsWidgetData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AssetsWidgetClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
