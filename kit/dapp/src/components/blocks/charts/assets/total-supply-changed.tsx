'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useAssetStats } from '@/lib/queries/asset-stats/asset-stats';
import type { Address } from 'viem';

interface TotalSupplyChangedProps {
  address: Address;
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

export function TotalSupplyChanged({ address }: TotalSupplyChangedProps) {
  const { data } = useAssetStats({ address });

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
      footer={
        <div className="text-muted-foreground text-xs">
          Last updated: {timeseries.at(-1)?.timestamp}
        </div>
      }
    />
  );
}
