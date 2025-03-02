'use client';

import { useTranslations } from 'next-intl';

export function useAssetTypeFormatter() {
  const t = useTranslations('admin.dashboard.charts');

  const formatAssetType = (type: string): string => {
    const assetType = type.toLowerCase();
    switch (assetType) {
      case 'bond':
        return t('asset-types.bonds');
      case 'cryptocurrency':
        return t('asset-types.cryptocurrencies');
      case 'equity':
        return t('asset-types.equities');
      case 'fund':
        return t('asset-types.funds');
      case 'stablecoin':
        return t('asset-types.stablecoins');
      default:
        return type;
    }
  };

  return formatAssetType;
}
