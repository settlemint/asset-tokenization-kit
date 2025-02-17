'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { columns, icons } from './columns';
import { getBonds } from './data';

export function BondsTableClient() {
  return (
    <AssetTableClient
      refetchInterval={60_000}
      assetConfig={assetConfig.bond}
      dataAction={getBonds}
      columns={columns}
      icons={icons}
    />
  );
}
