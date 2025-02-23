'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useAssetStats } from '@/lib/queries/asset-stats/asset-stats';
import type { Address } from 'viem';

interface TotalVolumeProps {
  address: Address;
}

const chartConfig = {
  totalVolume: {
    label: 'Total volume',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function TotalVolume({ address }: TotalVolumeProps) {
  const { data } = useAssetStats({ address });

  const timeseries = createTimeSeries(data, ['totalVolume'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
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
      footer={
        <div className="text-muted-foreground text-xs">
          Last updated: {timeseries.at(-1)?.timestamp}
        </div>
      }
    />
  );
}
