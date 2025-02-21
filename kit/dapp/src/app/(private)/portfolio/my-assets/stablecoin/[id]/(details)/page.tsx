import { getStableCoin } from '@/app/(private)/admin/stablecoins/[id]/(details)/_components/data';
import { AssetDetailGrid } from '@/components/blocks/asset-detail-grid/asset-detail-grid';
import { TotalSupplyChanged } from '@/components/blocks/asset-stats/total-supply-changed/total-supply-changed';
import { TotalSupply } from '@/components/blocks/asset-stats/total-supply/total-supply';
import { TotalTransfers } from '@/components/blocks/asset-stats/total-transfers/total-transfers';
import { TotalVolume } from '@/components/blocks/asset-stats/total-volume/total-volume';
import { assetConfig } from '@/lib/config/assets';
import type { Address } from 'viem';
import { GridClient } from './_components/grid-client';
import { GridClientCollateral } from './_components/grid-client-collateral';

export default async function StableCoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <AssetDetailGrid asset={id as Address} assetConfig={assetConfig.stablecoin} dataAction={getStableCoin}>
        <GridClient asset={id as Address} />
      </AssetDetailGrid>
      <AssetDetailGrid
        asset={id as Address}
        assetConfig={assetConfig.stablecoin}
        dataAction={getStableCoin}
        className="mt-4"
      >
        <GridClientCollateral asset={id as Address} />
      </AssetDetailGrid>
      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <TotalSupply asset={id as Address} />
        <TotalSupplyChanged asset={id as Address} />
        <TotalTransfers asset={id as Address} />
        <TotalVolume asset={id as Address} />
      </div>
    </>
  );
}
