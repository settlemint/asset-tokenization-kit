'use client';

import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { useStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { formatDate, formatDuration } from '@/lib/utils/date';
import { formatNumber } from '@/lib/utils/number';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import type { Address } from 'viem';

interface CollateralProps {
  address: Address;
}

export function Collateral({ address }: CollateralProps) {
  const { data: asset } = useStableCoinDetail({ address });
  const t = useTranslations('admin.stablecoins.collateral');

  return (
    <Suspense>
      <DetailGrid className="mt-4">
        <DetailGridItem
          label={t('proven-collateral')}
          info={t('proven-collateral-info')}
        >
          {formatNumber(asset.collateral, { token: asset.symbol })}
        </DetailGridItem>
        <DetailGridItem
          label={t('required-collateral-threshold')}
          info={t('required-collateral-threshold-info')}
        >
          {formatNumber(100, { percentage: true, decimals: 2 })}
        </DetailGridItem>
        <DetailGridItem
          label={t('committed-collateral-ratio')}
          info={t('committed-collateral-ratio-info')}
        >
          {formatNumber(asset.collateralCommittedRatio, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t('collateral-proof-expiration')}
          info={t('collateral-proof-expiration-info')}
        >
          {formatDate(asset.collateralProofValidity, {
            type: 'absolute',
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t('collateral-proof-validity')}
          info={t('collateral-proof-validity-info')}
        >
          {formatDuration(asset.liveness)}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
