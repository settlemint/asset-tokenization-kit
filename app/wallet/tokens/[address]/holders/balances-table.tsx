"use client";

import { useTokenDetails } from "@/app/wallet/tokens/[address]/_queries/token-details";
import { AddressHover } from "@/components/global/identity/hover-address";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { formatToken } from "@/lib/i18n";

export function BalancesTable({ address }: { address: string }) {
  const { data } = useTokenDetails(address);

  const balances = data?.erc20Contract?.balances ?? [];
  const totalSupply = data?.erc20Contract?.totalSupply ?? "0";

  return (
    <DataTable
      columns={[
        {
          id: "address",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Holder Address" />,
          cell: ({ row }) => {
            const value = row.original.account?.id;
            return value ? <AddressHover address={value} /> : null;
          },
        },
        {
          accessorKey: "value",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
          cell: ({ row }) => {
            const value = row.original.value;
            return formatToken(Number.parseFloat(value), data?.erc20Contract?.decimals ?? 18);
          },
        },
        {
          accessorKey: "percentage",
          header: ({ column }) => <DataTableColumnHeader column={column} title="% of Total Supply" />,
          cell: ({ row }) => {
            const value = row.original.value;
            const percentage =
              totalSupply !== "0" ? (Number.parseFloat(value) / Number.parseFloat(totalSupply)) * 100 : 0;
            return `${percentage.toFixed(2)}%`;
          },
        },
        {
          accessorKey: "account.ERC20transferToEvent",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Number of transactions received" />,
          cell: ({ row }) => {
            const transfersTo = row.original.account?.ERC20transferToEvent;
            return Array.isArray(transfersTo) ? transfersTo.length.toString() : "0";
          },
        },
        {
          accessorKey: "account.ERC20transferFromEvent",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Number of transactions sent" />,
          cell: ({ row }) => {
            const transfersFrom = row.original.account?.ERC20transferFromEvent;
            return Array.isArray(transfersFrom) ? transfersFrom.length.toString() : "0";
          },
        },
        {
          accessorKey: "lastTransaction",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Last Transaction" />,
          cell: ({ row }) => {
            const transfersFrom = row.original.account?.ERC20transferFromEvent;
            const firstTransfer = (transfersFrom ?? []).sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0];

            if (!firstTransfer) return "N/A";

            const date = new Date(Number(firstTransfer.timestamp) * 1000);
            return date.toLocaleString();
          },
        },
      ]}
      data={balances}
      filterColumn="address"
      filterPlaceholder="Search by address"
    />
  );
}
