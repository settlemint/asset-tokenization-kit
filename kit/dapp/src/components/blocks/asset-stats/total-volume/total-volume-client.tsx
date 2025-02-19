'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getAssetDetailStats } from '../data';

interface TotalVolumeClientProps {
  queryKey: QueryKey;
  asset: Address;
}

const chartConfig = {
  totalVolume: {
    label: 'Total volume',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function TotalVolumeClient({ queryKey, asset }: TotalVolumeClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: async () => getAssetDetailStats(asset),
  });

  const timeseries = createTimeSeries(data, ['totalVolume'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
    total: false,
    aggregation: 'first',
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title="Total volume"
      description="Showing the total volume of the token"
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
      footer={<div className="text-muted-foreground text-xs">Last updated: {timeseries.at(-1)?.timestamp}</div>}
    />
  );
}
