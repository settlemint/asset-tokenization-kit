'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries, formatInterval } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getTransactionsHistoryData } from './data';
import type { TransactionsHistoryProps } from './transactions-history';

interface TransactionsHistoryClientProps extends TransactionsHistoryProps {
  queryKey: QueryKey;
  processedAfter: Date;
}

export const TRANSACTIONS_CHART_CONFIG = {
  transaction: {
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
  });

  return (
    <AreaChartComponent
      data={createTimeSeries(data, ['transaction'], {
        ...chartOptions,
        aggregation: 'count',
      })}
      config={TRANSACTIONS_CHART_CONFIG}
      title="Transactions"
      description={`Showing transactions over the last ${formatInterval(chartOptions.intervalLength, chartOptions.intervalType)}`}
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
      chartContainerClassName={chartOptions.chartContainerClassName}
    />
  );
}
