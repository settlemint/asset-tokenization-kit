'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { formatDay, getTimestampMs } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { getAssetDetailStats } from '../data';

interface TotalSupplyChangedClientProps {
  queryKey: QueryKey;
  asset: Address;
}

const chartConfig = {
  totalMinted: {
    label: 'Total minted',
    color: 'hsl(var(--chart-2))',
  },
  totalBurned: {
    label: 'Total burned',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function TotalSupplyChangedClient({ queryKey, asset }: TotalSupplyChangedClientProps) {
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

    return days.map((day) => {
      const matchingData = data.find((item) => isSameDay(getTimestampMs(item.timestamp), day));

      return {
        timestamp: formatDay(day),
        totalMinted: Number(matchingData?.totalMinted ?? 0),
        totalBurned: Number(matchingData?.totalBurned ?? 0),
      };
    });
  }, [data]);

  return (
    <AreaChartComponent
      data={chartData}
      config={chartConfig}
      title="Supply changes"
      description="Showing the supply change of the token"
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
    />
  );
}
