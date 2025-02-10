'use client';

import { PieChartComponent } from '@/components/ui/pie-chart';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { type AssetBreakdown, getAssetsWidgetData } from './data';

type AssetType = AssetBreakdown['type'];
type AssetColors = Record<AssetType, string>;
type AssetConfig = Record<AssetType, { label: string; color: string }>;

const ASSET_COLORS: AssetColors = {
  Stablecoins: '#0ea5e9', // Bright blue
  Bonds: '#8b5cf6', // Purple
  Equities: '#4ade80', // Light green
  'Crypto Currencies': '#2563eb', // Royal blue
  Funds: '#10b981', // Emerald
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
