'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/evm-address-balances';
import { Button } from '@/components/ui/button';
import { formatTokenValue } from '@/lib/number';
import { theGraphClient, theGraphGraphql } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import { FolderOpen } from 'lucide-react';
import Link from 'next/link';

const ListAllTokens = theGraphGraphql(`
query ListAllTokens {
  erc20Contracts {
    id
    name
    symbol
    totalSupply
    decimals
  }
}
`);

// TODO: i hate the refetch intervals, and that i need to keep all these things on the
// client side. I'm wondering if we can do better
//   - is there a way to refesh in the background server side without the user noticing?
//   - can we listen to events from the portal?
//   - can we invalidate from the user actions? e.g. When i add a token i want a table update, but if someone else does it it can wait until the data is stale
//   - but how do we account for the time lag between tx processed and the data being updated in the graph? Best guess? Or using the _meta queries?
//   - see https://nextjs.org/docs/app/building-your-application/caching#time-based-revalidation
export function TokenTable() {
  const tokens = useSuspenseQuery({
    queryKey: ['all-tokens'],
    queryFn: () => {
      return theGraphClient.request(ListAllTokens, {});
    },
    refetchInterval: 2000,
  });

  return (
    <DataTable
      columns={[
        {
          accessorKey: 'id',
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Contract Address</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell>
                <EvmAddress address={value} prefixLength={100}>
                  <EvmAddressBalances address={value} />
                </EvmAddress>
              </DataTableColumnCell>
            );
          },
        },
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
          id: 'actions',
          cell: ({ row }) => {
            const { id } = row.original;

            return (
              <div className="flex items-center justify-end space-x-2 px-4 py-2">
                <Link prefetch={false} href={`/issuer/tokens/${id}/details`}>
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
      data={tokens.data.erc20Contracts ?? []}
      filterColumn="name"
      filterPlaceholder="Search by token name..."
    />
  );
}
