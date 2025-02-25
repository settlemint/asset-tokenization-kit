'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useUserCount } from '@/lib/queries/user/user-count';
import { startOfDay, subDays } from 'date-fns';

export const USERS_CHART_CONFIG = {
  users: {
    label: 'Users',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

export function UsersHistory() {
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const {
    data: { users },
  } = useUserCount({
    since: sevenDaysAgo,
  });

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
      title="Users"
      description="Showing users over the last 7 days"
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
    />
  );
}
