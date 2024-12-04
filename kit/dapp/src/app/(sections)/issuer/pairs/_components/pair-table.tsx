'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { formatTokenValue } from '@/lib/number';
import { theGraphClient, theGraphGraphql } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import { FolderOpen } from 'lucide-react';
import Link from 'next/link';

const ListAllPairs = theGraphGraphql(`
query ListAllPairs {
  erc20DexPairs {
    id
    name
    decimals
    symbol
    totalSupply
    quoteReserve
    quoteTokenPrice
    baseTokenPrice
    baseReserve
    swapFee
  }
}
`);

export function PairTable() {
  const tokens = useSuspenseQuery({
    queryKey: ['all-pairs'],
    queryFn: () => {
      return theGraphClient.request(ListAllPairs, {});
    },
    refetchInterval: 2000,
  });

  return (
    <DataTable
      columns={[
        {
          accessorKey: 'name',
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: 'symbol',
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: 'decimals',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader variant="numeric" column={column}>
                Decimals
              </DataTableColumnHeader>
            );
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell variant="numeric">{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: 'totalSupply',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Total Supply
              </DataTableColumnHeader>
            );
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell variant="numeric">
                {formatTokenValue(Number.parseFloat(value.toString()), 2)}
              </DataTableColumnCell>
            );
          },
        },
        {
          accessorKey: 'quoteReserve',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Quote Reserve
              </DataTableColumnHeader>
            );
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell variant="numeric">
                {formatTokenValue(Number.parseFloat(value.toString()), 2)}
              </DataTableColumnCell>
            );
          },
        },
        {
          accessorKey: 'quoteTokenPrice',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Quote Token Price
              </DataTableColumnHeader>
            );
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell variant="numeric">
                {formatTokenValue(Number.parseFloat(value.toString()), 2)}
              </DataTableColumnCell>
            );
          },
        },
        {
          accessorKey: 'baseTokenPrice',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Base Token Price
              </DataTableColumnHeader>
            );
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell variant="numeric">
                {formatTokenValue(Number.parseFloat(value.toString()), 2)}
              </DataTableColumnCell>
            );
          },
        },
        {
          accessorKey: 'baseReserve',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Base Reserve
              </DataTableColumnHeader>
            );
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell variant="numeric">
                {formatTokenValue(Number.parseFloat(value.toString()), 2)}
              </DataTableColumnCell>
            );
          },
        },
        {
          accessorKey: 'swapFee',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Swap Fee
              </DataTableColumnHeader>
            );
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell variant="numeric">
                {formatTokenValue(Number.parseFloat(value.toString()), 2)}
              </DataTableColumnCell>
            );
          },
        },
        {
          id: 'actions',
          cell: ({ row }) => {
            const { id } = row.original;

            return (
              <div className="flex items-center justify-end space-x-2 px-4 py-2">
                <Link prefetch={false} href={`/issuer/pairs/${id}/details`}>
                  <Button variant="outline">
                    <FolderOpen className="h-4 w-4" />
                    Details
                  </Button>
                </Link>
              </div>
            );
          },
        },
      ]}
      data={tokens.data.erc20DexPairs ?? []}
      filterColumn="name"
      filterPlaceholder="Search by token name..."
    />
  );
}
