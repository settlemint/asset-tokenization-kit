'use client';

import { useTranslations } from 'next-intl';

export function useAssetTypeFormatter() {
  const t = useTranslations('admin.dashboard.charts');

  const formatAssetType = (type: string): string => {
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

  return formatAssetType;
}
