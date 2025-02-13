'use client';

import { AssetTableClientServerSide } from '@/components/blocks/asset-table/asset-table-client-server-side';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useCallback } from 'react';
import { getStablecoinBalances } from './data';
import { columns } from './holders-columns';

interface HoldersTableClientProps {
  id: string;
  assetConfig: Pick<AssetDetailConfig, 'queryKey' | 'name'>;
}

export function HoldersTableClient({ id, assetConfig }: HoldersTableClientProps) {
  const getData = useCallback(
    async (pagination: { first: number; skip: number }) => {
      const result = await getStablecoinBalances(id, pagination);
      return { assets: result.holders, rowCount: result.count };
    },
    [id]
  );

  return (
    <AssetTableClientServerSide
      refetchInterval={5000}
      assetConfig={assetConfig}
      dataAction={getData}
      columns={columns}
    />
  );
}
