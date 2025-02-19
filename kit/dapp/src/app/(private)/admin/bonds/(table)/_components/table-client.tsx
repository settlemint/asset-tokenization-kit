'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { queryKeys } from '@/lib/react-query';
import { columns, icons } from './columns';
import { getBonds } from './data';

export function TableClient() {
  return (
    <AssetTableClient
      dataAction={getBonds}
      assetConfig={assetConfig.bond}
      columns={columns}
      icons={icons}
      queryKey={queryKeys.asset.all(assetConfig.bond.queryKey)}
    />
  );
}
