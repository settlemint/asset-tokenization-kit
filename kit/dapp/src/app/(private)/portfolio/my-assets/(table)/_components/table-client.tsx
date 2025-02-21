'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getMyAssets } from '../../../_components/data';
import { columns } from './columns';

interface MyAssetsTableClientProps {
  queryKey: QueryKey;
  wallet: Address;
}

export function MyAssetsTableClient({ queryKey, wallet }: MyAssetsTableClientProps) {
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: () => getMyAssets({ active: true, wallet: wallet }),
  });

  return <DataTable columns={columns} data={data.balances} name="My Assets" />;
}
