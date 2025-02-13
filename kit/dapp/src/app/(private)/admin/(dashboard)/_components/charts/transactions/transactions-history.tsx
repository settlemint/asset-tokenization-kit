import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTransactionsHistoryData } from './data';
import { TransactionsHistorySkeleton } from './transactions-history-chart-skeleton';
import { TransactionsHistoryClient } from './transactions-history-client';

export async function TransactionsHistory() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = ['TransactionsHistory'];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getTransactionsHistoryData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<TransactionsHistorySkeleton />}>
        <TransactionsHistoryClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
