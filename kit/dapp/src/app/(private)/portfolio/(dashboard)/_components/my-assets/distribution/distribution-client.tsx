'use client';

import { getMyAssets } from '@/app/(private)/portfolio/_components/data';
import { VerticalBarChartComponent } from '@/components/blocks/charts/bar-charts/vertical-bar-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { assetConfig } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

interface DistributionClientProps {
  queryKey: QueryKey;
  wallet: Address;
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

export function DistributionClient({ queryKey, wallet }: DistributionClientProps) {
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: () => getMyAssets({ active: true, wallet }),
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
