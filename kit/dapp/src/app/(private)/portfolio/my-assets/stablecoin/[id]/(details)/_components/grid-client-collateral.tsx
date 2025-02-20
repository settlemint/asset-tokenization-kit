'use client';

import { type StableCoin, getStableCoin } from '@/app/(private)/admin/stablecoins/[id]/(details)/_components/data';
import { AssetDetailGridClient } from '@/components/blocks/asset-detail-grid/asset-detail-grid-client';
import { AssetDetailGridItem } from '@/components/blocks/asset-detail-grid/asset-detail-grid-item';
import { assetConfig } from '@/lib/config/assets';
import { formatDate, formatDuration } from '@/lib/date';
import { formatNumber } from '@/lib/number';
import BigNumber from 'bignumber.js';
import { fromUnixTime } from 'date-fns';
import type { Address } from 'viem';

export function GridClientCollateral({ asset }: { asset: Address }) {
  return (
    <AssetDetailGridClient
      asset={asset}
      assetConfig={assetConfig.stablecoin}
      itemsAction={(asset: StableCoin) => {
        return (
          <>
            <AssetDetailGridItem
              label="Proven collateral"
              info="The amount of collateral that has been proven to be held by the token"
            >
              {formatNumber(asset.collateral, { token: asset.symbol })}
            </AssetDetailGridItem>
            <AssetDetailGridItem
              label="Required collateral threshold"
              info="The amount of collateral that must be proven"
            >
              {formatNumber(100, { percentage: true, decimals: 2 })}
            </AssetDetailGridItem>
            <AssetDetailGridItem
              label="Collateral ratio"
              info="The ratio of the collateral to the total supply of the token"
            >
              {formatNumber(new BigNumber(asset.collateral).dividedBy(asset.totalSupply).times(100), {
                percentage: true,
                decimals: 2,
              })}
            </AssetDetailGridItem>
            <AssetDetailGridItem
              label="Collateral proof expiration"
              info="From this point the collateral proof is invalid"
            >
              {formatDate(fromUnixTime(Number(asset.lastCollateralUpdate) + Number(asset.liveness)), {
                type: 'absolute',
              })}
            </AssetDetailGridItem>
            <AssetDetailGridItem label="Collateral proof validity" info="How long the collateral proof is valid for">
              {formatDuration(asset.liveness)}
            </AssetDetailGridItem>
          </>
        );
      }}
      dataAction={getStableCoin}
    />
  );
}
