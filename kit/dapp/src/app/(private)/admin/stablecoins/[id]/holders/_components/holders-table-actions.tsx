'use client';

import type { DataTableRowAction } from '@/components/blocks/data-table/data-table';
import { BlockHolderButton } from './block-form/button';
import type { getStablecoinBalances } from './data';

type Balance = Awaited<ReturnType<typeof getStablecoinBalances>>[number];

export const HoldersTableActions: DataTableRowAction<Balance>[] = [
  {
    label: 'Block',
    component: (row) => <BlockHolderButton address={row.stablecoin} holder={row.holder} blocked={row.blocked} />,
  },
];
