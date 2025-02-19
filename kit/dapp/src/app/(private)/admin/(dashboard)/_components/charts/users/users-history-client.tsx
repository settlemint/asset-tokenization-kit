'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getRecentUsers } from './data';

interface UsersHistoryClientProps {
  queryKey: QueryKey;
}

export const USERS_CHART_CONFIG = {
  users: {
    label: 'Users',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

export function UsersHistoryClient({ queryKey }: UsersHistoryClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getRecentUsers,
    refetchInterval: 1000 * 5,
  });

  return (
    <AreaChartComponent
      data={createTimeSeries(data, ['users'], {
        intervalType: 'day',
        intervalLength: 7,
        granularity: 'day',
        aggregation: 'count',
        total: true,
      })}
      config={USERS_CHART_CONFIG}
      title="Users"
      description="Showing users over the last 7 days"
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
    />
  );
}
