'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { columns } from './columns';
import { getFunds } from './data';

export function FundsTableClient() {
  return (
    <AssetTableClient refetchInterval={60_000} assetConfig={assetConfig.fund} dataAction={getFunds} columns={columns} />
  );
}
