'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { formatDay, getTimestampMs } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { getAssetDetailStats } from '../data';

interface TotalSupplyClientProps {
  queryKey: QueryKey;
  asset: Address;
}

const chartConfig = {
  totalSupply: {
    label: 'Total supply',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function TotalSupplyClient({ queryKey, asset }: TotalSupplyClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: async () => getAssetDetailStats(asset),
    refetchInterval: 1000 * 5,
  });

  const chartData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    const today = new Date();
    const days = eachDayOfInterval({
      start: subMonths(today, 1),
      end: today,
    });

    let currentTotalSupply = 0;
    return days.map((day) => {
      const matchingData = data.find((item) => isSameDay(getTimestampMs(item.timestamp), day));
      currentTotalSupply += Number(matchingData?.totalSupply ?? 0);

      return {
        timestamp: formatDay(day),
        totalSupply: currentTotalSupply,
      };
    });
  }, [data]);

  return (
    <AreaChartComponent
      data={chartData}
      config={chartConfig}
      title="Total supply"
      description="Showing the total supply of the token"
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
    />
  );
}
