'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { queryKeys } from '@/lib/react-query';
import { columns, icons } from './columns';
import { getStableCoins } from './data';

export function TableClient() {
  return (
    <AssetTableClient
      dataAction={getStableCoins}
      assetConfig={assetConfig.stablecoin}
      columns={columns}
      icons={icons}
      queryKey={queryKeys.asset.all(assetConfig.stablecoin.queryKey)}
    />
  );
}
