'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { CopyToClipboard } from '@/components/ui/copy';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { createColumnHelper } from '@tanstack/react-table';
import type { StableCoinHoldersBalance } from './data';

const columnHelper = createColumnHelper<StableCoinHoldersBalance['balances'][number]>();

export const columns = [
  columnHelper.accessor('id', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Wallet</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        {getValue() && (
          <div className="flex items-center">
            <EvmAddress address={getValue()}>
              <EvmAddressBalances address={getValue()} />
            </EvmAddress>
            <CopyToClipboard value={getValue()} displayText={''} className="ml-2" />
          </div>
        )}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('value', {
    id: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Amount
      </DataTableColumnHeader>
    ),
    cell: ({ getValue }) => <DataTableColumnCell variant="numeric">{getValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
];
