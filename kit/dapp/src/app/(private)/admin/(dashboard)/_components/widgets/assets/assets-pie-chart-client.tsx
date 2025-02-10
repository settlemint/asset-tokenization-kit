'use client';

import type { ChartConfig } from '@/components/ui/chart';
import { PieChartComponent } from '@/components/ui/pie-chart';
import { assetConfig } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getAssetsWidgetData } from './data';

const ASSET_PIE_CHART_CONFIG = Object.fromEntries(
  Object.entries(assetConfig).map(([_, asset]) => [asset.pluralName, { label: asset.pluralName, color: asset.color }])
) satisfies ChartConfig;

interface AssetsPieChartClientProps {
  queryKey: QueryKey;
}

export function AssetsPieChartClient({ queryKey }: AssetsPieChartClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getAssetsWidgetData,
    refetchInterval: 1000 * 10,
  });

  const chartData = data.breakdown.map((item) => ({
    ...item,
    fill: ASSET_PIE_CHART_CONFIG[item.type].color,
  }));

  return (
    <PieChartComponent
      title="Asset Distribution (in %)"
      data={chartData}
      dataKey="supplyPercentage"
      nameKey="type"
      config={ASSET_PIE_CHART_CONFIG}
    />
  );
}
