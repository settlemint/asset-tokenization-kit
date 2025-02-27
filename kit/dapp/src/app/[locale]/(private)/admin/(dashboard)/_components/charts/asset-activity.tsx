'use client';

import { BarChartComponent } from '@/components/blocks/charts/bar-charts/horizontal-bar-chart';
import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import type { ChartConfig } from '@/components/ui/chart';
import { useAssetActivity } from '@/lib/queries/asset-activity/asset-activity';
import { useTranslations } from 'next-intl';

export function AssetActivity() {
  const t = useTranslations('admin.dashboard.charts');
  const { data } = useAssetActivity();

  const chartConfig = {
    mintEventCount: {
      label: t('asset-activity.mint'),
      color: '#0d9488',
    },
    transferEventCount: {
      label: t('asset-activity.transfer'),
      color: '#3b82f6',
    },
    burnEventCount: {
      label: t('asset-activity.burn'),
      color: '#06b6d4',
    },
  } satisfies ChartConfig;

  const isEmpty = data.every(
    (asset) =>
      asset.mintEventCount === 0 &&
      asset.burnEventCount === 0 &&
      asset.transferEventCount === 0
  );

  if (isEmpty) {
    return <ChartSkeleton title={t('asset-activity.title')} variant="noData" />;
  }

  // Convert bigint values to numbers for the chart component
  const chartData = data.map((asset) => ({
    ...asset,
    mintEventCount: asset.mintEventCount,
    burnEventCount: asset.burnEventCount,
    transferEventCount: asset.transferEventCount,
    frozenEventCount: asset.frozenEventCount,
    unfrozenEventCount: asset.unfrozenEventCount,
  }));

  // Get asset type plural names from translations
  const getAssetPluralName = (type: string): string => {
    const assetType = type.toLowerCase();
    switch (assetType) {
      case 'bond':
        return t('asset-activity.asset-types.bonds');
      case 'cryptocurrency':
        return t('asset-activity.asset-types.cryptocurrencies');
      case 'equity':
        return t('asset-activity.asset-types.equities');
      case 'fund':
        return t('asset-activity.asset-types.funds');
      case 'stablecoin':
        return t('asset-activity.asset-types.stablecoins');
      default:
        return type;
    }
  };

  return (
    <BarChartComponent
      data={chartData}
      config={chartConfig}
      title={t('asset-activity.title')}
      description={t('asset-activity.description')}
      xAxis={{
        key: 'assetType',
        tickFormatter: (value: string) => getAssetPluralName(value),
      }}
    />
  );
}
