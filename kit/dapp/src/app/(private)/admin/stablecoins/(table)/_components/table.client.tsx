'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import type { ColumnDef } from '@tanstack/react-table';
import { columns, icons } from './columns';
import { type StableCoinAsset, getStableCoins } from './data';

export function StableCoinsTableClient() {
  return (
    <AssetTableClient
      refetchInterval={5000}
      assetConfig={assetConfig.stablecoin}
      dataAction={getStableCoins}
      columns={columns as ColumnDef<StableCoinAsset>[]}
      icons={icons}
    />
  );
}
