'use client';

import { BarChartComponent } from '@/components/ui/bar-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getAssetsEventsData } from './data';

interface EventsBarChartClientProps {
  queryKey: QueryKey;
}

const chartConfig = {
  mintEventCount: {
    label: 'Mint',
    color: 'hsl(var(--chart-1))',
  },
  transferEventCount: {
    label: 'Transfer',
    color: 'hsl(var(--chart-2))',
  },
  burnEventCount: {
    label: 'Burn',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function EventsBarChartClient({ queryKey }: EventsBarChartClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getAssetsEventsData,
    refetchInterval: 1000 * 5,
  });

  return (
    <BarChartComponent
      data={data.assetActivityDatas}
      config={chartConfig}
      title="Asset Events"
      xAxis={{
        key: 'assetType',
      }}
    />
  );
}
