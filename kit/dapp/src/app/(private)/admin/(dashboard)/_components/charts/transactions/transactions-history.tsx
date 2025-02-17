import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { Suspense } from 'react';
import { getTransactionsHistoryData } from './data';
import { TransactionsHistoryClient } from './transactions-history-client';

export async function TransactionsHistory() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = ['TransactionsHistory'];
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getTransactionsHistoryData({ processedAfter: sevenDaysAgo }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Transactions" variant="loading" />}>
        <TransactionsHistoryClient queryKey={queryKey} processedAfter={sevenDaysAgo} />
      </Suspense>
    </HydrationBoundary>
  );
}
