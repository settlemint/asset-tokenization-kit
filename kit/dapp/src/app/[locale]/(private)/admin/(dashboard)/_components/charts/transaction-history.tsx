'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries, formatInterval } from '@/lib/charts';
import { useProcessedTransactions } from '@/lib/queries/transactions/transactions-processed';
import { startOfDay, subDays } from 'date-fns';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

interface TransactionsHistoryProps {
  from?: Address;
}

export function TransactionsHistory({ from }: TransactionsHistoryProps) {
  const t = useTranslations('admin.dashboard.charts');
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const {
    data: { records },
  } = useProcessedTransactions({
    processedAfter: sevenDaysAgo,
    address: from,
  });

  const TRANSACTIONS_CHART_CONFIG = {
    transaction: {
      label: t('transaction-history.label'),
      color: '#3B9E99',
    },
  } satisfies ChartConfig;

  return (
    <AreaChartComponent
      data={createTimeSeries(records, ['transaction'], {
        aggregation: 'count',
        granularity: 'day',
        intervalType: 'day',
        intervalLength: 7,
      })}
      config={TRANSACTIONS_CHART_CONFIG}
      title={t('transaction-history.title')}
      description={t('transaction-history.description', {
        interval: formatInterval(7, 'day'),
      })}
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
    />
  );
}
