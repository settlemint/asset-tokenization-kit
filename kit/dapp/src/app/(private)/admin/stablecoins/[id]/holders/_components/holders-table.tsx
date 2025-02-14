'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { StablecoinBalance } from './data';
import { columns } from './holders-columns';

type HoldersTableProps = {
  id: string;
  balances: StablecoinBalance[];
};

export function HoldersTable({ id, balances }: HoldersTableProps) {
  return (
    <>
      <DataTable columns={columns} data={balances} name="Holders" />
    </>
  );
}
