"use client";

import { DataTable } from "@/components/global/data-table/data-table";
import { DataTableColumnHeader } from "@/components/global/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Link, formatToken } from "@/lib/i18n";
import { theGraphFallbackClient, theGraphFallbackGraphql } from "@/lib/settlemint/clientside/the-graph-fallback";
import { useSuspenseQuery } from "@tanstack/react-query";

const ListAllTokens = theGraphFallbackGraphql(`
  query ListAllTokens($orderBy: ERC20Contract_orderBy = name, $orderDirection: OrderDirection = asc, $first: Int = 10, $skip: Int = 0) {
  erc20Contracts(
    orderBy: $orderBy
    orderDirection: $orderDirection
    first: $first
    skip: $skip
  ) {
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
      return theGraphFallbackClient.request(ListAllTokens, {});
    },
  });

  return (
    <DataTable
      columns={[
        {
          accessorKey: "name",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="name" />;
          },
        },
        {
          accessorKey: "symbol",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Symbol" />;
          },
        },
        {
          accessorKey: "decimals",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Decimals" />;
          },
        },
        {
          accessorKey: "totalSupply",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Total Supply" />;
          },
          cell: ({ getValue }) => {
            const value = getValue<number>();
            return formatToken(Number.parseFloat(value.toString()), 2);
          },
        },
        {
          id: "actions",
          cell: ({ row }) => {
            const { id } = row.original;

            return (
              <Link prefetch={false} href={`/sonybankstablecoin/operator/stablecoin/${id}`}>
                <Button variant="outline">Details</Button>
              </Link>
            );
          },
        },
      ]}
      data={tokens.data.erc20Contracts}
      filterColumn="name"
      filterPlaceholder="Search by name"
    />
  );
}
