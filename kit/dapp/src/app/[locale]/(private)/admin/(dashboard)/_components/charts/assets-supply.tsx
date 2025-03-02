import { getAssetColor } from '@/components/blocks/asset-type-icon/asset-color';
import { PieChartComponent } from '@/components/blocks/charts/pie-chart';
import { getAssetActivity } from '@/lib/queries/asset-activity/asset-activity';
import { getTranslations } from 'next-intl/server';

export async function AssetsSupply() {
  const t = await getTranslations('admin.dashboard.charts');
  const data = await getAssetActivity();
  const chartData = data.map((item) => ({
    assetType: item.assetType,
    totalSupply: Number(item.totalSupply),
  }));
  type AssetType = Awaited<
    ReturnType<typeof getAssetActivity>
  >[number]['assetType'];
  const config: Record<AssetType, { label: string; color: string }> = {
    bond: {
      label: t('asset-types.bonds'),
      color: 'hsl(var(--chart-1))',
    },
    cryptocurrency: {
      label: t('asset-types.cryptocurrencies'),
      color: `hsl(var(--${getAssetColor('cryptocurrency')}))`,
    },
    equity: {
      label: t('asset-types.equities'),
      color: `hsl(var(--${getAssetColor('equity')}))`,
    },
    fund: {
      label: t('asset-types.funds'),
      color: `hsl(var(--${getAssetColor('fund')}))`,
    },
    stablecoin: {
      label: t('asset-types.stablecoins'),
      color: `hsl(var(--${getAssetColor('stablecoin')}))`,
    },
  };
  return (
    <PieChartComponent
      description={t('assets-supply.description')}
      title={t('assets-supply.label')}
      data={chartData}
      dataKey="totalSupply"
      nameKey="assetType"
      config={config}
    />
  );
}
