import { TransactionsHistory as TransactionsHistoryCommon } from '@/components/blocks/transactions-table/transactions-history';
import { getTransactionsTimeline } from '@/lib/queries/transactions/transactions-timeline';
import { startOfDay, subDays } from 'date-fns';
import { getTranslations } from 'next-intl/server';

export async function TransactionsHistory() {
  const t = await getTranslations('admin.dashboard.charts');
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const dataOneWeek = await getTransactionsTimeline({
    timelineStartDate: sevenDaysAgo,
    granularity: 'DAY',
  });

  return (
    <TransactionsHistoryCommon
      title={t('transaction-history.title')}
      description={t('transaction-history.description')}
      data={dataOneWeek}
      chartOptions={{
        intervalType: 'week',
        intervalLength: 1,
        granularity: 'day',
      }}
    />
  );
}
