import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { getEquityDetail } from '@/lib/queries/equity/equity-detail';
import { formatNumber } from '@/lib/utils/number';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import type { Address } from 'viem';

interface DetailsProps {
  address: Address;
}

export async function Details({ address }: DetailsProps) {
  const equity = await getEquityDetail({ address });
  const t = await getTranslations('admin.equities.details');
  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t('name')}>{equity.name}</DetailGridItem>
        <DetailGridItem label={t('symbol')}>{equity.symbol}</DetailGridItem>
        {equity.isin && (
          <DetailGridItem label={t('isin')}>{equity.isin}</DetailGridItem>
        )}
        <DetailGridItem label={t('contract-address')}>
          <EvmAddress
            address={equity.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('creator')}>
          <EvmAddress
            address={equity.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('decimals')}>{equity.decimals}</DetailGridItem>
        <DetailGridItem label={t('total-supply')} info={t('total-supply-info')}>
          {equity.totalSupply}
        </DetailGridItem>
        <DetailGridItem
          label={t('ownership-concentration')}
          info={t('ownership-concentration-info')}
        >
          {formatNumber(equity.concentration, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
