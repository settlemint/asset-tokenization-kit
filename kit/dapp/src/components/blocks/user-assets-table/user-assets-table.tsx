import { DataTable } from "@/components/blocks/data-table/data-table";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import type { Address } from "viem";
import { columns } from "./user-assets-table-columns";

interface UserAssetsTableProps {
  wallet: Address;
  title: string;
}

export default async function UserAssetsTable({
  wallet,
  title,
}: UserAssetsTableProps) {
  const userAssetsBalance = await getUserAssetsBalance(wallet);

  return (
    <DataTable
      columns={columns}
      data={userAssetsBalance.balances}
      name={title}
    />
  );
}
