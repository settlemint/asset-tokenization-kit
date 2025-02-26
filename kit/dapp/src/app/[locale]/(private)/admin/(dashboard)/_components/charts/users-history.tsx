'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useUserCount } from '@/lib/queries/user/user-count';
import { startOfDay, subDays } from 'date-fns';
import { useTranslations } from 'next-intl';

export function UsersHistory() {
  const t = useTranslations('admin.dashboard.charts');
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const {
    data: { users },
  } = useUserCount({
    since: sevenDaysAgo,
  });

  const USERS_CHART_CONFIG = {
    users: {
      label: t('users-history.label'),
      color: '#3b82f6',
    },
  } satisfies ChartConfig;

  return (
    <AreaChartComponent
      data={createTimeSeries(users, ['users'], {
        intervalType: 'day',
        intervalLength: 7,
        granularity: 'day',
        aggregation: 'count',
        accumulation: 'total',
      })}
      config={USERS_CHART_CONFIG}
      title={t('users-history.title')}
      description={t('users-history.description')}
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
    />
  );
}
