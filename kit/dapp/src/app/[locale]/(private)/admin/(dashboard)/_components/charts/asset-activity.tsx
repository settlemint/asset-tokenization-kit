import { BarChartComponent } from '@/components/blocks/charts/bar-charts/horizontal-bar-chart';
import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import type { ChartConfig } from '@/components/ui/chart';
import { getAssetActivity } from '@/lib/queries/asset-activity/asset-activity';
import { getTranslations } from 'next-intl/server';

export async function AssetActivity() {
  const t = await getTranslations('admin.dashboard.charts');
  const data = await getAssetActivity();

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
      asset.mintEventCount === 0n &&
      asset.burnEventCount === 0n &&
      asset.transferEventCount === 0n
  );

  if (isEmpty) {
    return <ChartSkeleton title={t('asset-activity.title')} variant="noData" />;
  }

  // Convert bigint values to numbers for the chart component
  const chartData = data.map((asset) => ({
    ...asset,
    mintEventCount: Number(asset.mintEventCount),
    burnEventCount: Number(asset.burnEventCount),
    transferEventCount: Number(asset.transferEventCount),
    frozenEventCount: Number(asset.frozenEventCount),
    unfrozenEventCount: Number(asset.unfrozenEventCount),
  }));

  return (
    <BarChartComponent
      data={chartData}
      config={chartConfig}
      title={t('asset-activity.title')}
      description={t('asset-activity.description')}
      xAxis={{
        key: 'assetType',
        assetTypeFormatter: true,
      }}
    />
  );
}
