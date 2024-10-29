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

export function TokenTable() {
  const tokens = useSuspenseQuery({
    queryKey: ["all-tokens"],
    queryFn: () => {
      return theGraphClient.request(ListAllTokens, {});
    },
    refetchInterval: 2000,
  });

  return (
    <DataTable
      columns={[
        {
          accessorKey: "name",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "symbol",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "decimals",
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
          accessorKey: "totalSupply",
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
          id: "actions",
          cell: ({ row }) => {
            const { id } = row.original;

            return (
              <div className="flex items-center space-x-2 px-4 py-2 justify-end">
                <Link prefetch={false} href={`/issuer/tokens/${id}/details`}>
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
      data={tokens.data.erc20Contracts ?? []}
      filterColumn="name"
      filterPlaceholder="Search by token name..."
    />
  );
}
