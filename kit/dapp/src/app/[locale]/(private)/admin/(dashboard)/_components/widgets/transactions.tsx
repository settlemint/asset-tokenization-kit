'use client';

import { useProcessedTransactions } from '@/lib/queries/transactions/transactions-processed';
import { startOfDay, subDays } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Widget } from './widget';

export function TransactionsWidget() {
  const t = useTranslations('admin.dashboard.widgets');
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const {
    data: { total, recentCount },
  } = useProcessedTransactions({
    processedAfter: sevenDaysAgo,
  });

  return (
    <Widget
      label={t('transactions.label')}
      value={total.toLocaleString()}
      subtext={t('transactions.subtext', { count: recentCount, days: 7 })}
    />
  );
}
