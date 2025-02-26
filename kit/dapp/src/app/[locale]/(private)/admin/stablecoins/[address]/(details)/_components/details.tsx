'use client';

import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { useStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { formatNumber } from '@/lib/utils/number';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import type { Address } from 'viem';

interface DetailsProps {
  address: Address;
}

export function Details({ address }: DetailsProps) {
  const { data: asset } = useStableCoinDetail({ address });
  const t = useTranslations('admin.stablecoins.details');
  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t('name')}>{asset.name}</DetailGridItem>
        <DetailGridItem label={t('symbol')}>{asset.symbol}</DetailGridItem>
        {asset.isin && (
          <DetailGridItem label={t('isin')}>{asset.isin}</DetailGridItem>
        )}
        <DetailGridItem label={t('contract-address')}>
          <EvmAddress
            address={asset.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('creator')}>
          <EvmAddress
            address={asset.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('decimals')}>{asset.decimals}</DetailGridItem>
        <DetailGridItem label={t('total-supply')} info={t('total-supply-info')}>
          {formatNumber(asset.totalSupply, { token: asset.symbol })}
        </DetailGridItem>
        <DetailGridItem
          label={t('ownership-concentration')}
          info={t('ownership-concentration-info')}
        >
          {formatNumber(asset.concentration, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
