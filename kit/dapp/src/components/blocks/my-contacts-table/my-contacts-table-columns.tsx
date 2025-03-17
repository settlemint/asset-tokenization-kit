'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils/date';
import type { ColumnDef } from '@tanstack/react-table';
import { User2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ComponentType, Suspense } from 'react';

interface Contact {
  id: string;
  name: string;
  wallet: string;
  created_at: unknown;
  user_id: string;
  updated_at: unknown;
}

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  user: User2,
};

export function columns() {
  const t = useTranslations('portfolio.my-contacts.table');

  return () => {
    const columns: ColumnDef<Contact>[] = [
      {
        id: 'name',
        accessorKey: 'name',
        header: () => t('name-header'),
        cell: ({ row }: any) => (
          <>
            <Suspense fallback={<Skeleton className="size-8 rounded-lg" />}>
              <AddressAvatar address={row.original.wallet} size="small" />
            </Suspense>
            <span>{row.original.name}</span>
          </>
        ),
        enableColumnFilter: false,
      },
      {
        id: 'wallet',
        accessorKey: 'wallet',
        header: () => t('wallet-header'),
        cell: ({ row }: any) => (
          <div className="flex items-center">
            <EvmAddress
              address={row.original.wallet}
              prettyNames={false}
              copyToClipboard={true}
            >
              <EvmAddressBalances address={row.original.wallet} />
            </EvmAddress>
          </div>
        ),
        enableColumnFilter: false,
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: () => t('created-at-header'),
        cell: ({ row }: any) => {
          const createdAt = row.original.created_at;
          return createdAt
            ? formatDate(new Date(createdAt), { type: 'distance' })
            : '-';
        },
        enableColumnFilter: false,
      },
    ];

    return columns;
  };
}
