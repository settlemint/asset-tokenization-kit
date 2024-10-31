"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import { DataTableColumnCell } from "@/components/blocks/data-table/data-table-column-cell";
import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { formatTokenValue } from "@/lib/number";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import Link from "next/link";
import type { Address } from "viem";

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
    queryKey: ["portfolio-tokens", address],
    queryFn: () => {
      return theGraphClient.request(ListPortfolioTokens, { account: address });
    },
    refetchInterval: 2000,
  });

  return (
    <DataTable
      columns={[
        {
          accessorKey: "contract.name",
          id: "name",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "contract.symbol",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "contract.decimals",
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
          accessorKey: "contract.totalSupply",
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
          id: "prices",
          header: ({ column }) => {
            return (
              <DataTableColumnHeader column={column} variant="numeric">
                Prices
              </DataTableColumnHeader>
            );
          },
          cell: ({ row }) => {
            const {
              contract: { pairsQuoteToken },
            } = row.original;

            return (
              <DataTableColumnCell variant="numeric">
                <ul className="text-right">
                  {pairsQuoteToken.map((pair) => (
                    <li key={pair.baseToken.symbol}>
                      {pair.baseTokenPrice} {pair.baseToken.symbol}
                    </li>
                  ))}
                </ul>
              </DataTableColumnCell>
            );
          },
        },
        {
          id: "actions",
          cell: ({ row }) => {
            const {
              contract: { id },
            } = row.original;
            console.log(id);
            return (
              <div className="flex items-center space-x-2 px-4 py-2 justify-end">
                <Link prefetch={false} href={`/user/portfolio/${id}/details`}>
                  <Button variant="outline">
                    <FolderOpen className="w-4 h-4" />
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
