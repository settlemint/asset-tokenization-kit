"use client";

import { useTokenDetails } from "@/app/wallet/tokens/[address]/_queries/token-details";
import { DataTable } from "@/components/global/data-table/data-table";
import { DataTableColumnHeader } from "@/components/global/data-table/data-table-column-header";
import { AddressHover } from "@/components/global/identity/hover-address";
import { formatToken } from "@/lib/i18n";

export function BalancesTable({ address }: { address: string }) {
  const { data } = useTokenDetails(address);

  const balances = data?.erc20Contract?.balances ?? [];

  return (
    <DataTable
      columns={[
        {
          accessorKey: "id",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Holder Address" />,
          cell: ({ row }) => {
            const value = row.original.id;
            return <AddressHover address={value} />;
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
      ]}
      data={balances}
      filterColumn="id"
      filterPlaceholder="Search by address"
    />
  );
}
