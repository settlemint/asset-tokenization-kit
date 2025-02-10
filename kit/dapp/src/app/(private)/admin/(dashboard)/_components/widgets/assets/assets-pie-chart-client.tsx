'use client';

import type { ChartConfig } from '@/components/ui/chart';
import { PieChartComponent } from '@/components/ui/pie-chart';
import { ASSET_COLORS, type AssetType } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getAssetsWidgetData } from './data';

type AssetPieChartConfig = Record<AssetType, { label: string; color: string }>;

const ASSET_PIE_CHART_CONFIG: AssetPieChartConfig = Object.fromEntries(
  Object.entries(ASSET_COLORS).map(([key, color]) => [key, { label: key, color }])
) as AssetPieChartConfig satisfies ChartConfig;

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
    fill: ASSET_COLORS[item.type],
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
