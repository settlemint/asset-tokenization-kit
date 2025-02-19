'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
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
  });

  const timeseries = createTimeSeries(data, ['totalSupply'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
    total: true,
    aggregation: 'first',
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title="Total supply"
      description="Showing the total supply of the token"
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
      footer={<div className="text-muted-foreground text-xs">Last updated: {timeseries.at(-1)?.timestamp}</div>}
    />
  );
}
