'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useAssetStats } from '@/lib/queries/asset-stats/asset-stats';
import type { Address } from 'viem';

interface TotalSupplyProps {
  address: Address;
}

const chartConfig = {
  totalSupply: {
    label: 'Total supply',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function TotalSupply({ address }: TotalSupplyProps) {
  const { data } = useAssetStats({ address });

  const timeseries = createTimeSeries(data, ['totalSupply'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
    accumulation: 'max',
    aggregation: 'first',
    historical: true,
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title="Total supply"
      description="Showing the total supply of the token"
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
