'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getTransactionsHistoryData } from './data';
import type { TransactionsHistoryProps } from './transactions-history';

interface TransactionsHistoryClientProps extends NonNullable<TransactionsHistoryProps> {
  queryKey: QueryKey;
  processedAfter: Date;
}

export const TRANSACTIONS_CHART_CONFIG = {
  transactions: {
    label: 'Transactions',
    color: '#3B9E99',
  },
} satisfies ChartConfig;

export function TransactionsHistoryClient({
  queryKey,
  processedAfter,
  from,
  chartOptions,
}: TransactionsHistoryClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: () => getTransactionsHistoryData({ processedAfter, from }),
    refetchInterval: 1000 * 5,
  });

  return (
    <AreaChartComponent
      data={createTimeSeries(data, ['transactions'], {
        ...chartOptions,
        aggregation: 'count',
      })}
      config={TRANSACTIONS_CHART_CONFIG}
      title="Transactions"
      description="Showing transactions over the last 7 days"
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
    />
  );
}
