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
import type { Address } from 'viem';

const ListPortfolioTokens = theGraphGraphql(`
query ListPortfolioTokens($account: String!) {
  erc20Balances(where: {account: $account}) {
    contract {
      name
      symbol
      totalSupply
      decimals
      id
      pairsQuoteToken {
        baseTokenPrice
        baseToken {
          symbol
        }
      }
    }
    value
  }
}
`);

export function PortfolioTable({ address }: { address: Address }) {
  const tokens = useSuspenseQuery({
    queryKey: ['portfolio-tokens', address],
    queryFn: () => {
      return theGraphClient.request(ListPortfolioTokens, { account: address });
    },
    refetchInterval: 2000,
  });

  return (
    <DataTable
      columns={[
        {
          accessorKey: 'contract.name',
          id: 'name',
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: 'contract.symbol',
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: 'contract.decimals',
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
          accessorKey: 'value',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Amount
              </DataTableColumnHeader>
            );
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell variant="numeric">
                {formatTokenValue(Number.parseFloat(value), 2)}
              </DataTableColumnCell>
            );
          },
        },
        {
          id: 'prices',
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Prices
              </DataTableColumnHeader>
            );
          },
          cell: ({ row }) => {
            const {
              contract: { pairsQuoteToken, symbol },
            } = row.original;

            return (
              <DataTableColumnCell variant="numeric">
                <ul className="text-right">
                  {pairsQuoteToken.length > 0 ? (
                    pairsQuoteToken.map((pair) => (
                      <li key={pair.baseToken.symbol}>
                        {formatTokenValue(Number.parseFloat(pair.baseTokenPrice), 2)} {pair.baseToken.symbol}
                      </li>
                    ))
                  ) : (
                    <li>
                      {formatTokenValue(Number.parseFloat('1'), 2)} {symbol}
                    </li>
                  )}
                </ul>
              </DataTableColumnCell>
            );
          },
        },
        {
          id: 'actions',
          cell: ({ row }) => {
            const {
              contract: { id },
            } = row.original;
            return (
              <div className="flex items-center justify-end space-x-2 px-4 py-2">
                <Link prefetch={false} href={`/user/portfolio/${id}/details`}>
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
      data={tokens.data.erc20Balances ?? []}
      filterColumn="name"
      filterPlaceholder="Search by token name..."
    />
  );
}
