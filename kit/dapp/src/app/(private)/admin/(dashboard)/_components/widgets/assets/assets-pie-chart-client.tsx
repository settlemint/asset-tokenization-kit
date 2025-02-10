'use client';

import { PieChartComponent } from '@/components/ui/pie-chart';
import { assetConfig } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { type AssetBreakdown, getAssetsWidgetData } from './data';

type AssetType = AssetBreakdown['type'];
type AssetColors = Record<AssetType, string>;
type AssetConfig = Record<AssetType, { label: string; color: string }>;

const ASSET_COLORS: AssetColors = {
  [assetConfig.stablecoin.pluralName]: '#0ea5e9', // Bright blue
  [assetConfig.bond.pluralName]: '#8b5cf6', // Purple
  [assetConfig.equity.pluralName]: '#4ade80', // Light green
  [assetConfig.cryptocurrency.pluralName]: '#2563eb', // Royal blue
  [assetConfig.fund.pluralName]: '#10b981', // Emerald
};

const ASSET_CONFIG: AssetConfig = Object.fromEntries(
  Object.entries(ASSET_COLORS).map(([key, color]) => [key, { label: key, color }])
) as AssetConfig;

interface DashboardWidgetClientProps {
  queryKey: QueryKey;
}

export function AssetsPieChartClient({ queryKey }: DashboardWidgetClientProps) {
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
      config={ASSET_CONFIG}
    />
  );
}
