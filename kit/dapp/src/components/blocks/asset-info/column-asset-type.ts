'use client';

import type { AssetType } from '@/app/[locale]/(private)/assets/[assettype]/types';
import { useTranslations } from 'next-intl';

interface AssetTypeProps {
  assettype:
    | AssetType
    | 'bond'
    | 'cryptocurrency'
    | 'equity'
    | 'fund'
    | 'stablecoin'
    | 'tokenizeddeposit';
  plural?: boolean;
}

export function ColumnAssetType({ assettype, plural }: AssetTypeProps) {
  const t = useTranslations('asset-type');

  if (assettype === 'bonds' || assettype === 'bond') {
    return plural ? t('bonds-plural') : t('bonds');
  }
  if (assettype === 'cryptocurrencies' || assettype === 'cryptocurrency') {
    return plural ? t('cryptocurrencies-plural') : t('cryptocurrencies');
  }
  if (assettype === 'stablecoins' || assettype === 'stablecoin') {
    return plural ? t('stablecoins-plural') : t('stablecoins');
  }
  if (assettype === 'tokenizeddeposits' || assettype === 'tokenizeddeposit') {
    return plural ? t('tokenizeddeposits-plural') : t('tokenizeddeposits');
  }
  if (assettype === 'equities' || assettype === 'equity') {
    return plural ? t('equities-plural') : t('equities');
  }
  if (assettype === 'funds' || assettype === 'fund') {
    return plural ? t('funds-plural') : t('funds');
  }
  return t('unknown');
}
