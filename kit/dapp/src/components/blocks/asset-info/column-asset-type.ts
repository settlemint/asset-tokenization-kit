'use client';

import type { AssetType } from '@/lib/utils/zod';
import { useTranslations } from 'next-intl';

interface AssetTypeProps {
  assettype: AssetType;
  plural?: boolean;
}

export function ColumnAssetType({ assettype, plural }: AssetTypeProps) {
  const t = useTranslations('asset-type');

  if (assettype === 'bond') {
    return plural ? t('bonds-plural') : t('bonds');
  }
  if (assettype === 'cryptocurrency') {
    return plural ? t('cryptocurrencies-plural') : t('cryptocurrencies');
  }
  if (assettype === 'stablecoin') {
    return plural ? t('stablecoins-plural') : t('stablecoins');
  }
  if (assettype === 'tokenizeddeposit') {
    return plural ? t('tokenizeddeposits-plural') : t('tokenizeddeposits');
  }
  if (assettype === 'equity') {
    return plural ? t('equities-plural') : t('equities');
  }
  if (assettype === 'fund') {
    return plural ? t('funds-plural') : t('funds');
  }
  return t('unknown');
}
