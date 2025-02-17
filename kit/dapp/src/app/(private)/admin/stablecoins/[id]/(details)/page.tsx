import { getStableCoin } from '@/app/(private)/admin/stablecoins/[id]/(details)/_components/data';
import { TotalSupplyChanged } from '@/components/blocks/asset-stats/total-supply-changed/total-supply-changed';
import { TotalSupply } from '@/components/blocks/asset-stats/total-supply/total-supply';
import { TotalTransfers } from '@/components/blocks/asset-stats/total-transfers/total-transfers';
import { TotalVolume } from '@/components/blocks/asset-stats/total-volume/total-volume';
import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailsGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { formatDate, formatDuration } from '@/lib/date';
import { formatNumber } from '@/lib/number';
import BigNumber from 'bignumber.js';
import { fromUnixTime } from 'date-fns';
import type { Address } from 'viem';

export default async function StableCoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getStableCoin(id);

  return (
    <>
      <DetailGrid>
        <DetailsGridItem label="Name">{asset.name}</DetailsGridItem>
        <DetailsGridItem label="Symbol">{asset.symbol}</DetailsGridItem>
        {asset.isin && <DetailsGridItem label="ISIN">{asset.isin}</DetailsGridItem>}
        <DetailsGridItem label="Contract address">
          <EvmAddress address={asset.id} prettyNames={false} hoverCard={false} copyToClipboard={true} />
        </DetailsGridItem>
        <DetailsGridItem label="Creator">
          <EvmAddress address={asset.creator.id} hoverCard={false} copyToClipboard={true} />
        </DetailsGridItem>
        <DetailsGridItem label="Decimals">{asset.decimals}</DetailsGridItem>
        <DetailsGridItem label="Total supply" info="The total supply of the token">
          {formatNumber(asset.totalSupply, { token: asset.symbol })}
        </DetailsGridItem>
        <DetailsGridItem label="# Token Holders">
          {formatNumber(asset.amountOfHolders, { decimals: 0 })}
        </DetailsGridItem>
        <DetailsGridItem label="Ownership concentration" info="Percentage owned by the top 5 holders">
          {formatNumber(asset.concentration, { percentage: true, decimals: 2 })}
        </DetailsGridItem>
      </DetailGrid>
      <DetailGrid className="mt-4">
        <DetailsGridItem
          label="Proven collateral"
          info="The amount of collateral that has been proven to be held by the token"
        >
          {formatNumber(asset.collateral, { token: asset.symbol })}
        </DetailsGridItem>
        <DetailsGridItem label="Required collateral threshold" info="The amount of collateral that must be proven">
          {formatNumber(100, { percentage: true, decimals: 2 })}
        </DetailsGridItem>
        <DetailsGridItem label="Collateral ratio" info="The ratio of the collateral to the total supply of the token">
          {formatNumber(new BigNumber(asset.collateral).dividedBy(asset.totalSupply).times(100), {
            percentage: true,
            decimals: 2,
          })}
        </DetailsGridItem>
        <DetailsGridItem label="Collateral proof expiration" info="From this point the collateral proof is invalid">
          {formatDate(fromUnixTime(Number(asset.lastCollateralUpdate) + Number(asset.liveness)), {
            type: 'absolute',
          })}
        </DetailsGridItem>
        <DetailsGridItem label="Collateral proof validity" info="How long the collateral proof is valid for">
          {formatDuration(asset.liveness)}
        </DetailsGridItem>
      </DetailGrid>
      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <TotalSupply asset={id as Address} />
        <TotalSupplyChanged asset={id as Address} />
        <TotalTransfers asset={id as Address} />
        <TotalVolume asset={id as Address} />
      </div>
    </>
  );
}
