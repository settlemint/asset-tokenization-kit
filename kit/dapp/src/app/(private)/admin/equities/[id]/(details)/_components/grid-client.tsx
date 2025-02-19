'use client';
import { AssetDetailGridClient } from '@/components/blocks/asset-detail-grid/asset-detail-grid-client';
import { AssetDetailGridItem } from '@/components/blocks/asset-detail-grid/asset-detail-grid-item';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { assetConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';
import type { Address } from 'viem';
import { type Equity, getEquity } from './data';

export function GridClient({ asset }: { asset: Address }) {
  return (
    <AssetDetailGridClient
      asset={asset}
      assetConfig={assetConfig.equity}
      itemsAction={(asset: Equity) => {
        return (
          <>
            <AssetDetailGridItem label="Name">{asset.name}</AssetDetailGridItem>
            <AssetDetailGridItem label="Symbol">{asset.symbol}</AssetDetailGridItem>
            {asset.isin && <AssetDetailGridItem label="ISIN">{asset.isin}</AssetDetailGridItem>}
            <AssetDetailGridItem label="Contract address">
              <EvmAddress address={asset.id as Address} prettyNames={false} hoverCard={false} copyToClipboard={true} />
            </AssetDetailGridItem>
            <AssetDetailGridItem label="Creator">
              <EvmAddress address={asset.creator.id as Address} hoverCard={false} copyToClipboard={true} />
            </AssetDetailGridItem>
            <AssetDetailGridItem label="Decimals">{asset.decimals}</AssetDetailGridItem>
            <AssetDetailGridItem label="Total supply" info="The total supply of the token">
              {formatNumber(asset.totalSupply, { token: asset.symbol })}
            </AssetDetailGridItem>
            <AssetDetailGridItem label="Ownership concentration" info="Percentage owned by the top 5 holders">
              {formatNumber(asset.concentration, { percentage: true, decimals: 2 })}
            </AssetDetailGridItem>
            <AssetDetailGridItem label="Fund category">{asset.equityCategory}</AssetDetailGridItem>
            <AssetDetailGridItem label="Fund class">{asset.equityClass}</AssetDetailGridItem>
          </>
        );
      }}
      dataAction={getEquity}
      refetchInterval={5000}
    />
  );
}
