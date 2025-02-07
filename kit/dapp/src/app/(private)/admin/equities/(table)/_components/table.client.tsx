'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import type { ColumnDef } from '@tanstack/react-table';
import { columns, icons } from './columns';
import { type EquityAsset, getEquities } from './data';

export function EquitiesTableClient() {
  return (
    <AssetTableClient
      refetchInterval={5000}
      assetConfig={assetConfig.equity}
      dataAction={getEquities}
      columns={columns as ColumnDef<EquityAsset>[]}
      icons={icons}
    />
  );
}
