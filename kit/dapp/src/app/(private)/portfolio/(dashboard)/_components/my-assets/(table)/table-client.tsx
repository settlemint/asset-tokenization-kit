'use client';

import { getMyAssets } from '@/app/(private)/portfolio/_components/data';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { columns } from './columns';

interface SmallMyAssetsTableClientProps {
  queryKey: QueryKey;
  active?: boolean;
  wallet: Address;
}

export function SmallMyAssetsTableClient({ queryKey, active, wallet }: SmallMyAssetsTableClientProps) {
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: () => getMyAssets({ active, wallet }),
    refetchInterval: defaultRefetchInterval,
  });

  return (
    <DataTable
      columns={columns}
      data={data.balances}
      name="My Assets"
      pagination={{ enablePagination: false }}
      toolbar={{ enableToolbar: false }}
      initialSorting={[{ id: 'value', desc: true }]}
    />
  );
}
