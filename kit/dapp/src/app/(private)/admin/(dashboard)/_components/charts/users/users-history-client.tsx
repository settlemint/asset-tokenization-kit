'use client';
import { AreaChartComponent } from '@/components/ui/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getRecentUsers } from './data';

interface UsersHistoryClientProps {
  queryKey: QueryKey;
}

export const USERS_CHART_CONFIG = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const DEMO_DATA = [
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

export function UsersHistoryClient({ queryKey }: UsersHistoryClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getRecentUsers,
    refetchInterval: 1000 * 5,
  });

  return (
    <AreaChartComponent
      data={DEMO_DATA}
      config={USERS_CHART_CONFIG}
      title="User Activity"
      description="Showing total users for the last 7 days"
      xAxis={{ key: 'month' }}
    />
  );
}
