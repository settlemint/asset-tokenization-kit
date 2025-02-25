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
        <DetailGridItem label="Name">{asset.name}</DetailGridItem>
        <DetailGridItem label="Symbol">{asset.symbol}</DetailGridItem>
        {asset.isin && (
          <DetailGridItem label="ISIN">{asset.isin}</DetailGridItem>
        )}
        <DetailGridItem label={t('contract-address')}>
          <EvmAddress
            address={asset.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label="Creator">
          <EvmAddress
            address={asset.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label="Decimals">{asset.decimals}</DetailGridItem>
        <DetailGridItem
          label="Total supply"
          info="The total supply of the token"
        >
          {formatNumber(asset.totalSupply, { token: asset.symbol })}
        </DetailGridItem>
        <DetailGridItem
          label="Ownership concentration"
          info="Percentage owned by the top 5 holders"
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
