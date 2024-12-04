"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import { DataTableColumnCell } from "@/components/blocks/data-table/data-table-column-cell";
import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/evm-address-balances";
import { useTokenDetails } from "../../_queries/token-details";

export function BalancesTable({ address }: { address: string }) {
  const { data } = useTokenDetails(address);

  const balances = data?.erc20Contract?.balances ?? [];
  const totalSupply = data?.erc20Contract?.totalSupply ?? "0";

  return (
    <DataTable
      columns={[
        {
          accessorKey: "account.id",
          id: "address",
          header: ({ column }) => <DataTableColumnHeader column={column}>Holder Address</DataTableColumnHeader>,
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <DataTableColumnCell>
                <EvmAddress address={value}>
                  <EvmAddressBalances address={value} />
                </EvmAddress>
              </DataTableColumnCell>
            );
          },
        },
        {
          accessorKey: "lastTransaction",
          header: ({ column }) => <DataTableColumnHeader column={column}>Last Transaction</DataTableColumnHeader>,
          cell: ({ row }) => {
            const transfersFrom = row.original.account?.ERC20transferFromEvent;
            const firstTransfer = (transfersFrom ?? []).sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0];

            if (!firstTransfer) {
              return <DataTableColumnCell>N/A</DataTableColumnCell>;
            }

            const date = new Date(Number(firstTransfer.timestamp) * 1000);
            return <DataTableColumnCell>{date.toLocaleString()}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "value",
          header: ({ column }) => (
            <DataTableColumnHeader variant="numeric" column={column}>
              Balance
            </DataTableColumnHeader>
          ),
          cell: ({ row }) => {
            const value = row.original.value;
            return <DataTableColumnCell variant="numeric">{value}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "percentage",
          header: ({ column }) => (
            <DataTableColumnHeader variant="numeric" column={column}>
              % of Total Supply
            </DataTableColumnHeader>
          ),
          cell: ({ row }) => {
            const value = row.original.value;
            const percentage =
              totalSupply !== "0" ? (Number.parseFloat(value) / Number.parseFloat(totalSupply)) * 100 : 0;
            return <DataTableColumnCell variant="numeric">{`${percentage.toFixed(2)}%`}</DataTableColumnCell>;
          },
        },
        {
          accessorKey: "account.ERC20transferToEvent",
          header: ({ column }) => (
            <DataTableColumnHeader variant="numeric" column={column}>
              Number of transactions received
            </DataTableColumnHeader>
          ),
          cell: ({ row }) => {
            const transfersTo = row.original.account?.ERC20transferToEvent;
            return (
              <DataTableColumnCell variant="numeric">
                {Array.isArray(transfersTo) ? transfersTo.length.toString() : "0"}
              </DataTableColumnCell>
            );
          },
        },
        {
          accessorKey: "account.ERC20transferFromEvent",
          header: ({ column }) => (
            <DataTableColumnHeader variant="numeric" column={column}>
              Number of transactions sent
            </DataTableColumnHeader>
          ),
          cell: ({ row }) => {
            const transfersFrom = row.original.account?.ERC20transferFromEvent;
            return (
              <DataTableColumnCell variant="numeric">
                {Array.isArray(transfersFrom) ? transfersFrom.length.toString() : "0"}
              </DataTableColumnCell>
            );
          },
        },
      ]}
      data={balances}
      filterColumn="address"
      filterPlaceholder="Search by address..."
    />
  );
}
