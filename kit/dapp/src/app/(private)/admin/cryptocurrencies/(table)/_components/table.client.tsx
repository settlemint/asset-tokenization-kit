'use client';

import { AssetTableClient } from '@/components/blocks/asset-table/asset-table-client';
import { assetConfig } from '@/lib/config/assets';
import type { ColumnDef } from '@tanstack/react-table';
import { columns } from './columns';
import { type CryptoCurrencyAsset, getCryptocurrencies } from './data';

export function CryptocurrenciesTableClient() {
  return (
    <AssetTableClient
      refetchInterval={5000}
      assetConfig={assetConfig.cryptocurrency}
      dataAction={getCryptocurrencies}
      columns={columns as ColumnDef<CryptoCurrencyAsset>[]}
    />
  );
}
