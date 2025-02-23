'use client';

import { DetailGrid } from '@/components/blocks/detail-grid/detail-grid';
import { DetailGridItem } from '@/components/blocks/detail-grid/detail-grid-item';
import { useStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { formatDate, formatDuration } from '@/lib/utils/date';
import { formatNumber } from '@/lib/utils/number';
import { Suspense } from 'react';
import type { Address } from 'viem';

interface CollateralProps {
  address: Address;
}

export function Collateral({ address }: CollateralProps) {
  const { data: asset } = useStableCoinDetail({ address });

  return (
    <Suspense>
      <DetailGrid className="mt-4">
        <DetailGridItem
          label="Proven collateral"
          info="The amount of collateral that has been proven to be held by the token"
        >
          {formatNumber(asset.collateral, { token: asset.symbol })}
        </DetailGridItem>
        <DetailGridItem
          label="Required collateral threshold"
          info="The amount of collateral that must be proven"
        >
          {formatNumber(100, { percentage: true, decimals: 2 })}
        </DetailGridItem>
        <DetailGridItem
          label="Committed collateral ratio"
          info="The ratio of the collateral committed to the total supply of the token"
        >
          {formatNumber(asset.collateralCommittedRatio, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem>
        <DetailGridItem
          label="Collateral proof expiration"
          info="From this point the collateral proof is invalid"
        >
          {formatDate(asset.collateralProofValidity, {
            type: 'absolute',
          })}
        </DetailGridItem>
        <DetailGridItem
          label="Collateral proof validity"
          info="How long the collateral proof is valid for"
        >
          {formatDuration(asset.liveness)}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
