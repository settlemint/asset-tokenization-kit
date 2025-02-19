'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { queryKeys } from '@/lib/react-query';
import { columns } from './columns';
import { getCryptocurrencies } from './data';

export function TableClient() {
  return (
    <AssetTableClient
      dataAction={getCryptocurrencies}
      assetConfig={assetConfig.cryptocurrency}
      refetchInterval={5000}
      columns={columns}
      queryKey={queryKeys.assets.all('cryptocurrencies')}
    />
  );
}
