'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import {} from 'date-fns';
import { getTransactionsHistoryData } from './data';

interface TransactionsHistoryClientProps {
  queryKey: QueryKey;
}

export const TRANSACTIONS_CHART_CONFIG = {
  transactions: {
    label: 'Transactions',
    color: '#3B9E99',
  },
} satisfies ChartConfig;

export function TransactionsHistoryClient({ queryKey }: TransactionsHistoryClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getTransactionsHistoryData,
    refetchInterval: 1000 * 5,
  });

  return (
    <AreaChartComponent
      data={createTimeSeries(data, ['transactions'], {
        intervalType: 'day',
        intervalLength: 7,
        granularity: 'day',
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
