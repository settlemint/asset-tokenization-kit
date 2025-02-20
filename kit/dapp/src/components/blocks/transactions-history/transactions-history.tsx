import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { type TimeSeriesOptions, getInterval } from '@/lib/charts';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTransactionsHistoryData } from './data';
import { TransactionsHistoryClient } from './transactions-history-client';

export interface TransactionsHistoryProps {
  from?: string;
  chartOptions: Pick<TimeSeriesOptions, 'intervalType' | 'intervalLength' | 'granularity'> & {
    chartContainerClassName?: string;
  };
}

export async function TransactionsHistory({ from, chartOptions }: TransactionsHistoryProps) {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.dashboard.chart('transaction');

  const processedAfter = new Date(
    getInterval(chartOptions.granularity, chartOptions.intervalType, chartOptions.intervalLength).start
  );

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getTransactionsHistoryData({ processedAfter, from }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Transactions" variant="loading" />}>
        <TransactionsHistoryClient
          queryKey={queryKey}
          processedAfter={processedAfter}
          from={from}
          chartOptions={chartOptions}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
