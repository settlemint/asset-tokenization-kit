'use client';

import { BarChartComponent } from '@/components/blocks/charts/bar-charts/horizontal-bar-chart';
import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import type { ChartConfig } from '@/components/ui/chart';
import { assetConfig } from '@/lib/config/assets';
import { useAssetActivity } from '@/lib/queries/asset-activity/asset-activity';

const chartConfig = {
  mintEventCount: {
    label: 'Mint',
    color: '#0d9488',
  },
  transferEventCount: {
    label: 'Transfer',
    color: '#3b82f6',
  },
  burnEventCount: {
    label: 'Burn',
    color: '#06b6d4',
  },
} satisfies ChartConfig;

export function AssetActivity() {
  const { data } = useAssetActivity();

  const isEmpty = data.every(
    (asset) =>
      asset.mintEventCount === 0n &&
      asset.burnEventCount === 0n &&
      asset.transferEventCount === 0n
  );

  if (isEmpty) {
    return <ChartSkeleton title="Activity" variant="noData" />;
  }

  // Convert bigint values to numbers for the chart component
  const chartData = data.map((asset) => ({
    ...asset,
    mintEventCount: Number(asset.mintEventCount),
    burnEventCount: Number(asset.burnEventCount),
    transferEventCount: Number(asset.transferEventCount),
    frozenEventCount: Number(asset.frozenEventCount),
    unfrozenEventCount: Number(asset.unfrozenEventCount),
  }));

  return (
    <BarChartComponent
      data={chartData}
      config={chartConfig}
      title="Activity"
      description="Showing events for each asset type"
      xAxis={{
        key: 'assetType',
        tickFormatter: (value: string) => {
          const assetType = value.toLowerCase() as keyof typeof assetConfig;
          return assetConfig[assetType]?.pluralName ?? value;
        },
      }}
    />
  );
}
