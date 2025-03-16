import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { getTokenizedDepositDetail } from '@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail';
import { formatNumber } from '@/lib/utils/number';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import type { Address } from 'viem';

interface TokenizedDepositsDetailsProps {
  address: Address;
}

export async function TokenizedDepositsDetails({
  address,
}: TokenizedDepositsDetailsProps) {
  const tokenizedDeposit = await getTokenizedDepositDetail({ address });
  const t = await getTranslations('admin.tokenized-deposits.details');
  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t('name')}>
          {tokenizedDeposit.name}
        </DetailGridItem>
        <DetailGridItem label={t('symbol')}>
          {tokenizedDeposit.symbol}
        </DetailGridItem>
        {tokenizedDeposit.isin && (
          <DetailGridItem label={t('isin')}>
            {tokenizedDeposit.isin}
          </DetailGridItem>
        )}
        <DetailGridItem label={t('contract-address')}>
          <EvmAddress
            address={tokenizedDeposit.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('creator')}>
          <EvmAddress
            address={tokenizedDeposit.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('decimals')}>
          {tokenizedDeposit.decimals}
        </DetailGridItem>
        <DetailGridItem label={t('total-supply')} info={t('total-supply-info')}>
          {formatNumber(tokenizedDeposit.totalSupply, {
            token: tokenizedDeposit.symbol,
          })}
        </DetailGridItem>
        <DetailGridItem label={t('total-burned')} info={t('total-burned-info')}>
          {formatNumber(tokenizedDeposit.totalBurned, {
            token: tokenizedDeposit.symbol,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t('total-holders')}
          info={t('total-holders-info')}
        >
          {formatNumber(tokenizedDeposit.totalHolders, { decimals: 0 })}
        </DetailGridItem>
        <DetailGridItem
          label={t('ownership-concentration')}
          info={t('ownership-concentration-info')}
        >
          {formatNumber(tokenizedDeposit.concentration, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
