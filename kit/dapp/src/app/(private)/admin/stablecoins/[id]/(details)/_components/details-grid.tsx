import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailsGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { formatNumber } from '@/lib/number';
import BigNumber from 'bignumber.js';
import { getStableCoin } from './data';

type DetailsGridProps = {
  id: string;
};

export async function DetailsGrid({ id }: DetailsGridProps) {
  const asset = await getStableCoin(id);

  return (
    <DetailGrid>
      <DetailsGridItem label="Name">{asset.name}</DetailsGridItem>
      <DetailsGridItem label="Symbol">{asset.symbol}</DetailsGridItem>
      <DetailsGridItem label="ISIN">{asset.isin}</DetailsGridItem>
      <DetailsGridItem label="Contract address">
        <EvmAddress address={asset.id} prettyNames={false} hoverCard={false} copyToClipboard={true} />
      </DetailsGridItem>
      {/*
        Waiting for the subgraph to be updated with the creator field
        <DetailsGridItem label="Creator">
          <EvmAddress address={asset.creator} hoverCard={false}  copyToClipboard={true} />
        </DetailsGridItem>
        */}
      <DetailsGridItem label="Decimals">{asset.decimals}</DetailsGridItem>
      <DetailsGridItem label="Total supply" info="The total supply of the token">
        {formatNumber(asset.totalSupply, { token: asset.symbol })}
      </DetailsGridItem>
      {/*
        Waiting for the subgraph to be updated with the creator field
        <DetailsGridItem label="# Token Holders">
          {formatNumber(asset.amountOfHolders, { decimals: 0 })}
        </DetailsGridItem>
        */}
      <DetailsGridItem label="Ownership concentration" info="Percentage owned by the top 5 holders">
        {formatNumber(asset.concentration, { percentage: true, decimals: 2 })}
      </DetailsGridItem>
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
      {/* <DetailsGridItem label="Collateral proof expiration" info="From this point the collateral proof is invalid">
        {formatDate(asset.lastCollateralUpdate + asset.liveness, { relative: true })}
      </DetailsGridItem> */}
      {/* <DetailsGridItem label="Collateral proof validity" info="How long the collateral proof is valid for">
        {formatNumber(asset.liveness, { decimals: 0 })} seconds
      </DetailsGridItem> */}
    </DetailGrid>
  );
}
