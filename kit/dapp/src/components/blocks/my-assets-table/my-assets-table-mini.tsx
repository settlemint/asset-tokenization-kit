import { DataTable } from "@/components/blocks/data-table/data-table";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import type { Address } from "viem";
import { columns } from "./my-assets-table-columns";

interface MyAssetsTableProps {
  wallet: Address;
  title: string;
}

export default async function MyAssetsTable({
  wallet,
  title,
}: MyAssetsTableProps) {
  const userAssetsBalance = await getUserAssetsBalance(wallet);

  return (
    <DataTable
      columns={columns}
      data={userAssetsBalance.balances}
      name={title}
      pagination={{ enablePagination: false }}
      toolbar={{ enableToolbar: false }}
      initialSorting={[{ id: "value", desc: true }]}
      className="h-full"
    />
  );
}
