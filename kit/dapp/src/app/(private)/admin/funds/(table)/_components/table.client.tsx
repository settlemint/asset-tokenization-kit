'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import type { ColumnDef } from '@tanstack/react-table';
import { columns } from './columns';
import { type FundAsset, getFunds } from './data';

export function FundsTableClient() {
  return (
    <AssetTableClient
      refetchInterval={5000}
      assetConfig={assetConfig.fund}
      dataAction={getFunds}
      columns={columns as ColumnDef<FundAsset>[]}
    />
  );
}
