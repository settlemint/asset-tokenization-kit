'use client';

import { PieChartComponent } from '@/components/ui/pie-chart';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { type AssetBreakdown, getAssetsWidgetData } from './data';

type AssetType = AssetBreakdown['type'];
type AssetColors = Record<AssetType, string>;
type AssetConfig = Record<AssetType, { label: string; color: string }>;

const ASSET_COLORS: AssetColors = {
  Stablecoins: '#38bdf8', // Bright sky blue
  Bonds: '#3b82f6', // Bright blue
  Equities: '#14b8a6', // Teal
  'Crypto Currencies': '#06b6d4', // Cyan
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
