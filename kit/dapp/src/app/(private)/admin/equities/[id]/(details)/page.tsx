import { TotalSupplyChanged } from '@/components/blocks/asset-stats/total-supply-changed/total-supply-changed';
import { TotalSupply } from '@/components/blocks/asset-stats/total-supply/total-supply';
import { TotalTransfers } from '@/components/blocks/asset-stats/total-transfers/total-transfers';
import { TotalVolume } from '@/components/blocks/asset-stats/total-volume/total-volume';
import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailsGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { formatNumber } from '@/lib/number';
import type { Address } from 'viem';
import { getEquity } from './_components/data';

export default async function EquityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getEquity(id);

  return (
    <>
      <DetailGrid>
        <DetailsGridItem label="Name">{asset.name}</DetailsGridItem>
        <DetailsGridItem label="Symbol">{asset.symbol}</DetailsGridItem>
        <DetailsGridItem label="ISIN">{asset.isin ?? '-'}</DetailsGridItem>
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
        <DetailsGridItem label="Ownership concentration" info="Percentage owned by the top 5 holders">
          {formatNumber(asset.concentration, { percentage: true, decimals: 2 })}
        </DetailsGridItem>
        <DetailsGridItem label="Equity category">{asset.equityCategory}</DetailsGridItem>
        <DetailsGridItem label="Equity class">{asset.equityClass}</DetailsGridItem>
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
