import { PieChartComponent } from '@/components/blocks/charts/pie-chart';
import { getAssetActivity } from '@/lib/queries/asset-activity/asset-activity';
import { getTranslations } from 'next-intl/server';

const assetColors = {
  bond: '#8b5cf6',
  cryptocurrency: '#2563eb',
  equity: '#4ade80',
  fund: '#10b981',
  stablecoin: '#0ea5e9',
} as const;

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
      color: assetColors.bond,
    },
    cryptocurrency: {
      label: t('asset-types.cryptocurrencies'),
      color: assetColors.cryptocurrency,
    },
    equity: {
      label: t('asset-types.equities'),
      color: assetColors.equity,
    },
    fund: {
      label: t('asset-types.funds'),
      color: assetColors.fund,
    },
    stablecoin: {
      label: t('asset-types.stablecoins'),
      color: assetColors.stablecoin,
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
