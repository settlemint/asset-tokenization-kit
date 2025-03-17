import { ChartGrid } from '@/components/blocks/chart-grid/chart-grid';
import { CollateralRatio } from '@/components/blocks/charts/assets/collateral-ratio';
import { TotalSupply } from '@/components/blocks/charts/assets/total-supply';
import { TotalSupplyChanged } from '@/components/blocks/charts/assets/total-supply-changed';
import { TotalTransfers } from '@/components/blocks/charts/assets/total-transfers';
import { TotalVolume } from '@/components/blocks/charts/assets/total-volume';
import { WalletDistribution } from '@/components/blocks/charts/assets/wallet-distribution';
import { getAssetDetail } from '@/lib/queries/asset-detail';
import type { AssetType } from '@/lib/utils/zod';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { Details } from './_components/details';
import { Related } from './_components/related';

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
    address: Address;
  }>;
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const { assettype, address } = await params;
  const asset = await getAssetDetail({ assettype, address });
  const t = await getTranslations('private.assets');

  return (
    <>
      <Details assettype={assettype} address={address} />
      <ChartGrid title={t('asset-statistics-title')}>
        {assettype === 'bond' && <CollateralRatio address={address} />}
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <WalletDistribution address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </ChartGrid>
      <Related
        assettype={assettype}
        address={address}
        totalSupply={asset.totalSupply}
      />
    </>
  );
}
