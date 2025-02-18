'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import { columns } from './columns';
import { getCryptocurrencies } from './data';

export function CryptocurrenciesTableClient() {
  return (
    <AssetTableClient
      refetchInterval={5_000}
      assetConfig={assetConfig.cryptocurrency}
      dataAction={getCryptocurrencies}
      columns={columns}
    />
  );
}
