import { DataTable } from "@/components/blocks/data-table/data-table";
import { geUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import type { Address } from "viem";
import { columns } from "./user-assets-table-columns";

interface UserAssetsTableProps {
  wallet: Address;
}

export default async function UserAssetsTable({
  wallet,
}: UserAssetsTableProps) {
  const userAssetsBalance = await geUserAssetsBalance(wallet);

  return (
    <DataTable
      columns={columns}
      data={userAssetsBalance.balances}
      name="user-assets-table"
    />
  );
}
