'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { eachDayOfInterval, format, isSameDay, subDays } from 'date-fns';
import { useMemo } from 'react';
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

  const chartData = useMemo(() => {
    if (!data) {
      return [];
    }

    const today = new Date();
    const dates = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return dates.map((date) => ({
      date: format(date, 'EEE, MMM d'),
      users: data.filter((user) => isSameDay(new Date(user.createdAt), date)).length,
    }));
  }, [data]);

  return (
    <AreaChartComponent
      data={chartData}
      config={USERS_CHART_CONFIG}
      title="Users"
      description="Showing total users over the last 7 days"
      xAxis={{ key: 'date' }}
    />
  );
}
