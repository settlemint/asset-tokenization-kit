'use client';

import { BarChartComponent } from '@/components/ui/bar-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { assetConfig } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { AssetActivitySkeleton } from './asset-activity-chart-skeleton';
import { getAssetsEventsData } from './data';

interface AssetActivityClientProps {
  queryKey: QueryKey;
}

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

export function AssetActivityClient({ queryKey }: AssetActivityClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getAssetsEventsData,
    refetchInterval: 1000 * 5,
  });

  const isEmpty = data.assetActivityDatas.every(
    (asset) => asset.mintEventCount === 0 && asset.burnEventCount === 0 && asset.transferEventCount === 0
  );

  if (isEmpty) {
    return <AssetActivitySkeleton variant="noData" />;
  }

  return (
    <BarChartComponent
      data={data.assetActivityDatas}
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
