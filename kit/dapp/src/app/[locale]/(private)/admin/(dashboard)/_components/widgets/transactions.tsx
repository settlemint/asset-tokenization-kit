'use client';

import { useProcessedTransactions } from '@/lib/queries/transactions/transactions-processed';
import { startOfDay, subDays } from 'date-fns';
import { Widget } from './widget';

export function TransactionsWidget() {
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const {
    data: { total, recentCount },
  } = useProcessedTransactions({
    processedAfter: sevenDaysAgo,
  });

  return (
    <Widget
      label="Transactions"
      value={total.toLocaleString()}
      subtext={`${recentCount} in last 7 days`}
    />
  );
}
