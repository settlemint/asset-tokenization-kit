'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
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
  });

  const timeseries = createTimeSeries(data, ['totalMinted', 'totalBurned'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
    aggregation: 'first',
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title="Supply changes"
      description="Showing the supply change of the token"
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
      footer={<div className="text-muted-foreground text-xs">Last updated: {timeseries.at(-1)?.timestamp}</div>}
    />
  );
}
