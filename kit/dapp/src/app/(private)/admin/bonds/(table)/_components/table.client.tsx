'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import type { ColumnDef } from '@tanstack/react-table';
import { columns, icons } from './columns';
import { type BondAsset, getBonds } from './data';

export function BondsTableClient() {
  return (
    <AssetTableClient
      refetchInterval={5000}
      assetConfig={assetConfig.bond}
      dataAction={getBonds}
      columns={columns as ColumnDef<BondAsset>[]}
      icons={icons}
    />
  );
}
