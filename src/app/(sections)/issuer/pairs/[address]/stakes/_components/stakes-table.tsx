"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import { DataTableColumnCell } from "@/components/blocks/data-table/data-table-column-cell";
import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/evm-address-balances";
import { usePairDetails } from "../../_queries/pair-details";

export function StakesTable({ address }: { address: string }) {
  const { data } = usePairDetails(address);

  const stakes = data?.erc20DexPair?.stakes ?? [];
  const totalSupply = data?.erc20DexPair?.totalSupply ?? "0";

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
      ]}
      data={stakes}
      filterColumn="address"
      filterPlaceholder="Search by address..."
    />
  );
}
