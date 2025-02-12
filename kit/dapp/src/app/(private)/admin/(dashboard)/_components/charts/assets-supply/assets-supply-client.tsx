'use client';
import type { ChartConfig } from '@/components/ui/chart';
import { PieChartComponent } from '@/components/ui/pie-chart';
import { assetConfig } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getAssetsWidgetData } from '../../common/assets/data';
import { AssetsSupplySkeleton } from './assets-supply-chart-skeleton';

const ASSET_PIE_CHART_CONFIG = Object.fromEntries(
  Object.entries(assetConfig).map(([, asset]) => [asset.pluralName, { label: asset.pluralName, color: asset.color }])
) satisfies ChartConfig;

interface AssetsSupplyClientProps {
  queryKey: QueryKey;
}

export function AssetsSupplyClient({ queryKey }: AssetsSupplyClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getAssetsWidgetData,
    refetchInterval: 1000 * 5,
  });

  const chartData = data.breakdown
    .filter((item) => item.supplyPercentage > 0)
    .map((item) => ({
      ...item,
      fill: ASSET_PIE_CHART_CONFIG[item.type].color,
    }));

  if (chartData.length === 0) {
    return <AssetsSupplySkeleton variant="noData" />;
  }

  return (
    <PieChartComponent
      description="Showing the distribution of assets (in %)"
      title="Distribution"
      data={chartData}
      dataKey="supplyPercentage"
      nameKey="type"
      config={ASSET_PIE_CHART_CONFIG}
    />
  );
}
