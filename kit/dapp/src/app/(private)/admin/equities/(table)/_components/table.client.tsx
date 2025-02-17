'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { columns, icons } from './columns';
import { getEquities } from './data';

export function EquitiesTableClient() {
  return (
    <AssetTableClient
      refetchInterval={60_000}
      assetConfig={assetConfig.equity}
      dataAction={getEquities}
      columns={columns}
      icons={icons}
    />
  );
}
