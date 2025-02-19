'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { queryKeys } from '@/lib/react-query';
import { columns, icons } from './columns';
import { getFunds } from './data';

export function TableClient() {
  return (
    <AssetTableClient
      dataAction={getFunds}
      assetConfig={assetConfig.fund}
      refetchInterval={5000}
      columns={columns}
      icons={icons}
      queryKey={queryKeys.assets.all('funds')}
    />
  );
}
