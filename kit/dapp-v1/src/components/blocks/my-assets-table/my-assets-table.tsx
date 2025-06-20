import { DataTable } from "@/components/blocks/data-table/data-table";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import type { Address } from "viem";
import { Columns } from "./my-assets-table-columns";

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
      columns={Columns}
      data={userAssetsBalance.balances}
      name={title}
    />
  );
}
