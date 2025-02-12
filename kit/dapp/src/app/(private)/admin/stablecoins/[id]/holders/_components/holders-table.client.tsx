'use client';

import { AssetTableClientServerSide } from '@/components/blocks/asset-table/asset-table-client-server-side';
import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import { getStablecoinBalances } from './data';
import { columns } from './holders-columns';

export async function HoldersTableClient() {
  const { id } = useParams<{ id: string }>();
  const getData = useCallback(
    (pagination: { first: number; skip: number }) => getStablecoinBalances(id, pagination),
    [id]
  );

  return (
    <AssetTableClientServerSide
      refetchInterval={5000}
      assetConfig={{
        queryKey: [],
        name: 'stablecoin-holders',
      }}
      dataAction={getData}
      columns={columns}
      pageSize={1}
      rowCount={5}
    />
  );
}
