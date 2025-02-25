'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries, formatInterval } from '@/lib/charts';
import { useProcessedTransactions } from '@/lib/queries/transactions/transactions-processed';
import { startOfDay, subDays } from 'date-fns';
import type { Address } from 'viem';

interface TransactionsHistoryProps {
  from?: Address;
}

export const TRANSACTIONS_CHART_CONFIG = {
  transaction: {
    label: 'Transactions',
    color: '#3B9E99',
  },
} satisfies ChartConfig;

export function TransactionsHistory({ from }: TransactionsHistoryProps) {
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const {
    data: { records },
  } = useProcessedTransactions({
    processedAfter: sevenDaysAgo,
    address: from,
  });

  return (
    <AreaChartComponent
      data={createTimeSeries(records, ['transaction'], {
        aggregation: 'count',
        granularity: 'day',
        intervalType: 'day',
        intervalLength: 7,
      })}
      config={TRANSACTIONS_CHART_CONFIG}
      title="Transactions"
      description={`Showing transactions over the last ${formatInterval(7, 'day')}`}
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
    />
  );
}
