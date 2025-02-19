import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTransactionsHistoryData } from './data';
import { TransactionsHistoryClient } from './transactions-history-client';

export async function TransactionsHistory() {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.dashboard.chart('transaction');

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getTransactionsHistoryData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Transactions" variant="loading" />}>
        <TransactionsHistoryClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
