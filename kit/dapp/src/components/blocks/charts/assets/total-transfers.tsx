'use client';

import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useAssetStats } from '@/lib/queries/asset-stats/asset-stats';
import type { Address } from 'viem';

interface TotalTransfersProps {
  address: Address;
}

const chartConfig = {
  totalTransfers: {
    label: 'Total transfers',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function TotalTransfers({ address }: TotalTransfersProps) {
  const { data } = useAssetStats({ address });

  const timeseries = createTimeSeries(data, ['totalTransfers'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
    aggregation: 'first',
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title="Total transfers"
      description="Showing the total transfers of the token"
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
