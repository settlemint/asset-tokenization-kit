'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { columns, icons } from './columns';
import { getStableCoins } from './data';

export function StableCoinsTableClient() {
  return (
    <AssetTableClient
      refetchInterval={60_0000}
      assetConfig={assetConfig.stablecoin}
      dataAction={getStableCoins}
      columns={columns}
      icons={icons}
    />
  );
}
