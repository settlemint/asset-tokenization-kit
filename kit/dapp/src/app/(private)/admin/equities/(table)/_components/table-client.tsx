'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { queryKeys } from '@/lib/react-query';
import { columns, icons } from './columns';
import { getEquities } from './data';

export function TableClient() {
  return (
    <AssetTableClient
      dataAction={getEquities}
      assetConfig={assetConfig.equity}
      refetchInterval={5000}
      columns={columns}
      icons={icons}
      queryKey={queryKeys.asset.all(assetConfig.equity.queryKey)}
    />
  );
}
