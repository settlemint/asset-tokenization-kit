import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { getCryptoCurrencyDetail } from '@/lib/queries/cryptocurrency/cryptocurrency-detail';
import { formatNumber } from '@/lib/utils/number';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import type { Address } from 'viem';

interface CryptocurrenciesDetailsProps {
  address: Address;
}

export async function CryptocurrenciesDetails({
  address,
}: CryptocurrenciesDetailsProps) {
  const cryptocurrency = await getCryptoCurrencyDetail({ address });
  const t = await getTranslations('admin.cryptocurrencies.details');
  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t('name')}>{cryptocurrency.name}</DetailGridItem>
        <DetailGridItem label={t('symbol')}>
          {cryptocurrency.symbol}
        </DetailGridItem>
        <DetailGridItem label={t('contract-address')}>
          <EvmAddress
            address={cryptocurrency.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('creator')}>
          <EvmAddress
            address={cryptocurrency.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('decimals')}>
          {cryptocurrency.decimals}
        </DetailGridItem>
        <DetailGridItem label={t('total-supply')} info={t('total-supply-info')}>
          {cryptocurrency.totalSupply}
        </DetailGridItem>
        <DetailGridItem
          label={t('ownership-concentration')}
          info={t('ownership-concentration-info')}
        >
          {formatNumber(cryptocurrency.concentration, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
