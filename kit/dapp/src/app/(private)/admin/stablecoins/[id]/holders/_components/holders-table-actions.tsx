'use client';

import type { DataTableRowAction } from '@/components/blocks/data-table/data-table';
import { PencilIcon, TrashIcon } from 'lucide-react';
import type { getStablecoinBalances } from './data';

type Balance = Awaited<ReturnType<typeof getStablecoinBalances>>[number];

export const HoldersTableActions: DataTableRowAction<Balance>[] = [
  {
    label: 'Edit',
    icon: PencilIcon,
    action: (row) => {
      // Handle edit
    },
  },
  {
    label: 'Delete',
    icon: TrashIcon,
    action: (row) => {
      // Handle delete
    },
  },
];
