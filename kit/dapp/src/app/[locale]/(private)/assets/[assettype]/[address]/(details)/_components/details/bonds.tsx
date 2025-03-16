import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { getBondDetail } from '@/lib/queries/bond/bond-detail';
import { format } from 'date-fns';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import type { Address } from 'viem';

interface BondsDetailsProps {
  address: Address;
}

export async function BondsDetails({ address }: BondsDetailsProps) {
  const bond = await getBondDetail({ address });
  const t = await getTranslations('admin.bonds.details');
  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t('name')}>{bond.name}</DetailGridItem>
        <DetailGridItem label={t('symbol')}>{bond.symbol}</DetailGridItem>
        {bond.isin && (
          <DetailGridItem label={t('isin')}>{bond.isin}</DetailGridItem>
        )}
        <DetailGridItem label={t('contract-address')}>
          <EvmAddress
            address={bond.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('creator')}>
          <EvmAddress
            address={bond.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t('deployed-on')}>
          {format(new Date(Number(bond.deployedOn) * 1000), 'PPP')}
        </DetailGridItem>
        {/* <DetailGridItem label={t("decimals")}>{bond.decimals}</DetailGridItem> */}
        <DetailGridItem label={t('total-supply')} info={t('total-supply-info')}>
          {bond.cap}
        </DetailGridItem>
        <DetailGridItem label={t('total-issued')} info={t('total-issued-info')}>
          {bond.totalSupply}
        </DetailGridItem>
        <DetailGridItem label={t('redeemed')} info={t('redeemed-info')}>
          {bond.isMatured ? bond.redeemedAmount : t('not-available')}{' '}
        </DetailGridItem>
        <DetailGridItem
          label={t('maturity-status')}
          info={t('maturity-status-info')}
        >
          {bond.isMatured
            ? t('matured')
            : bond.totalSupply < bond.cap
              ? t('issuing')
              : t('active')}
        </DetailGridItem>
        <DetailGridItem
          label={t('maturity-date')}
          info={t('maturity-date-info')}
        >
          {bond.maturityDate
            ? format(new Date(Number(bond.maturityDate) * 1000), 'PPP')
            : '-'}
        </DetailGridItem>
        <DetailGridItem label={t('yield-type')} info={t('yield-type-info')}>
          Fixed
        </DetailGridItem>
        <DetailGridItem label={t('face-value')} info={t('face-value-info')}>
          {bond.faceValue}
        </DetailGridItem>
        <DetailGridItem
          label={t('underlying-asset')}
          info={t('underlying-asset-info')}
        >
          <EvmAddress
            address={bond.underlyingAsset}
            prettyNames={true}
            hoverCard={true}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem
          label={t('underlying-asset-balance')}
          info={t('underlying-asset-balance-info')}
        >
          {bond.underlyingBalance}
        </DetailGridItem>
        <DetailGridItem
          label={t('redemption-readiness')}
          info={t('redemption-readiness-info')}
        >
          {/* Calculate percentage: (part/total) * 100
              Since we're using bigInt which doesn't support decimal division,
              we multiply the numerator by 100 before dividing to preserve precision */}
          {(bond.underlyingBalance * 100n) / bond.totalUnderlyingNeededExact}%
        </DetailGridItem>
        {/* <DetailGridItem
          label={t("ownership-concentration")}
          info={t("ownership-concentration-info")}
        >
          {formatNumber(bond.concentration, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem> */}
      </DetailGrid>
    </Suspense>
  );
}
