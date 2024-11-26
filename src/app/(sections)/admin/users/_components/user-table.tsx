"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import { DataTableColumnCell } from "@/components/blocks/data-table/data-table-column-cell";
import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/evm-address-balances";
import { Button } from "@/components/ui/button";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import Link from "next/link";

type Wallet = {
  email: string;
  role: string[] | null;
  wallet: string;
};

const ListAllUsers = hasuraGraphql(`
query ListAllUsers {
  starterkit_wallets(order_by: {email: asc}) {
    email
    role
    wallet
  }
}
`);

export function UsersTable() {
  const tokens = useSuspenseQuery({
    queryKey: ["all-users"],
    queryFn: () => {
      return hasuraClient.request(ListAllUsers, {});
    },
    refetchInterval: 2000,
  });

  return (
    <DataTable
      columns={[
        {
          accessorKey: "email",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Email</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return <DataTableColumnCell>{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "role",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Role</DataTableColumnHeader>;
          },
          cell: ({ getValue }) => {
            const value = getValue<string[] | null>();
            return <DataTableColumnCell>{value?.join(", ") ?? ""}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "wallet",
          header: ({ column }) => {
            return <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>;
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
          id: "actions",
          cell: ({ row }) => {
            const { email } = row.original;

            return (
              <DataTableColumnCell variant="numeric">
                <Link href={`/issuer/users/${email}/details`}>
                  <Button variant="outline">
                    <FolderOpen className="w-4 h-4" />
                    Details
                  </Button>
                </Link>
              </DataTableColumnCell>
            );
          },
        },
      ]}
      data={(tokens.data as { starterkit_wallets: Wallet[] }).starterkit_wallets ?? []}
      filterColumn="email"
      filterPlaceholder="Search by email..."
    />
  );
}
