'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import type { AssetBalance } from '@/lib/queries/asset-balance/asset-balance-fragment';
import { useAssetBalanceList } from '@/lib/queries/asset-balance/asset-balance-list';
import { formatDate } from '@/lib/utils/date';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Address } from 'viem';
import { getAddress } from 'viem';
import { BlockForm } from './actions/block-form/form';
import { FreezeForm } from './actions/freeze-form/form';

interface HoldersTableProps {
  address: Address;
}

const columnHelper = createColumnHelper<AssetBalance>();

const icons: Record<string, ComponentType<{ className?: string }>> = {
  blocked: XCircle,
  unblocked: CheckCircle,
};

export function HoldersTable({ address }: HoldersTableProps) {
  const { data: balances } = useAssetBalanceList({ address });

  return (
    <DataTable
      columns={[
        columnHelper.accessor('account.id', {
          header: 'Wallet',
          cell: ({ getValue }) => {
            const wallet = getAddress(getValue());
            return (
              <EvmAddress
                address={wallet}
                copyToClipboard={true}
                verbose={true}
              >
                <EvmAddressBalances address={wallet} />
              </EvmAddress>
            );
          },
          enableColumnFilter: false,
        }),
        columnHelper.accessor('value', {
          header: 'Balance',
          cell: ({ getValue }) => formatNumber(getValue()),
          enableColumnFilter: false,
          meta: {
            variant: 'numeric',
          },
        }),
        columnHelper.accessor('frozen', {
          header: 'Frozen',
          cell: ({ getValue }) => formatNumber(getValue()),
          enableColumnFilter: false,
          meta: {
            variant: 'numeric',
          },
        }),
        columnHelper.accessor('blocked', {
          header: 'Status',
          cell: ({ getValue }) => {
            const blocked: boolean = getValue();
            const Icon = icons[blocked ? 'blocked' : 'unblocked'];
            return (
              <>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span>{blocked ? 'Blocked' : 'Active'}</span>
              </>
            );
          },
        }),
        columnHelper.accessor('account.lastActivity', {
          header: 'Last activity',
          cell: ({ getValue }) => {
            const lastActivity = getValue();
            return lastActivity
              ? formatDate(lastActivity, { type: 'distance' })
              : '-';
          },
          enableColumnFilter: false,
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => {
            return (
              <DataTableRowActions>
                <BlockForm
                  address={address}
                  account={row.original.account.id}
                />
                <FreezeForm
                  address={address}
                  account={row.original.account.id}
                />
              </DataTableRowActions>
            );
          },
          meta: {
            enableCsvExport: false,
          },
        }),
      ]}
      data={balances}
      icons={icons}
      name={'Holders'}
    />
  );
}
