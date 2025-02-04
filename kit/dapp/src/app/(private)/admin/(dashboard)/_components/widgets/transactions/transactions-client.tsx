'use client';

import { Stat, StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getTransactionsWidgetData } from './data';

interface DashboardWidgetClientProps {
  queryKey: string[];
}

export function TransactionsWidgetClient({ queryKey }: DashboardWidgetClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getTransactionsWidgetData,
    refetchInterval: 1000 * 10,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return (
    <Stat>
      <StatLabel>Transactions</StatLabel>
      <StatValue>{data.totalTransactions.toLocaleString()}</StatValue>
      <StatSubtext>{data.transactionsInLast24Hours.toLocaleString()} in last 24 hours</StatSubtext>
    </Stat>
  );
}
