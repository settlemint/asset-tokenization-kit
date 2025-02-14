'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import type { ChartConfig } from '@/components/ui/chart';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { eachDayOfInterval, format, isSameDay, subDays } from 'date-fns';
import { useMemo } from 'react';
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

  const chartData = useMemo(() => {
    if (!data || !data.getProcessedTransactions?.records) {
      return [];
    }

    const today = new Date();
    const dates = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return dates.map((date) => ({
      date: format(date, 'EEE, MMM d'),
      transactions:
        data.getProcessedTransactions?.records.filter(
          (transaction) => transaction.createdAt && isSameDay(new Date(transaction.createdAt), date)
        ).length ?? 0,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return <ChartSkeleton title="Transactions" variant="noData" />;
  }

  return (
    <AreaChartComponent
      data={chartData}
      config={TRANSACTIONS_CHART_CONFIG}
      title="Transactions"
      description="Showing transactions over the last 7 days"
      xAxis={{ key: 'date' }}
    />
  );
}
