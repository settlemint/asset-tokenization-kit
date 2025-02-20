'use client';

import { VerticalBarChartComponent } from '@/components/blocks/charts/bar-charts/vertical-bar-chart';
import { getMyAssets } from '@/components/blocks/my-assets-table/data';
import type { ChartConfig } from '@/components/ui/chart';
import { assetConfig } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';

interface DistributionClientProps {
  queryKey: QueryKey;
}

const chartConfig = {
  percentage: {
    label: 'Percentage',
  },
  ...Object.fromEntries(
    Object.entries(assetConfig).map(([, asset]) => [
      asset.pluralName,
      {
        label: asset.pluralName,
        color: asset.color,
      },
    ])
  ),
} satisfies ChartConfig;

export function DistributionClient({ queryKey }: DistributionClientProps) {
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: () => getMyAssets(),
  });

  const chartData = data.distribution.map((item) => {
    const assetPluralName = assetConfig[item.asset.type].pluralName;
    return {
      assetType: assetPluralName,
      percentage: item.percentage,
      fill: `var(--color-${assetPluralName})`,
    };
  });

  return (
    <VerticalBarChartComponent
      data={chartData}
      config={chartConfig}
      title="Asset Distribution"
      description="Portfolio allocation by asset type"
      yAxis={{
        key: 'assetType',
      }}
      valueKey="percentage"
    />
  );
}
