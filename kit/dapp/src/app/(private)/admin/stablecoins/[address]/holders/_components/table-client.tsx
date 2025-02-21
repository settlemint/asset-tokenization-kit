'use client';

import { HoldersTableClient } from '@/components/blocks/asset-holders-table/asset-holders-table-client';
import { assetConfig } from '@/lib/config/assets';
import { useStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { queryKeys } from '@/lib/react-query';
import type { Address } from 'viem';
import { columns, icons } from './columns';

export function TableClient({ asset }: { asset: Address }) {
  const { data: stableCoin } = useStableCoinDetail({ id: asset });

  return (
    <HoldersTableClient
      queryKey={queryKeys.asset.stats({ address: asset, type: 'holders' })}
      asset={asset}
      columns={columns(asset, stableCoin.decimals, assetConfig.stablecoin)}
      icons={icons}
    />
  );
}
