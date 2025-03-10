import { DataTable } from "@/components/blocks/data-table/data-table";
import { geUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
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
  const userAssetsBalance = await geUserAssetsBalance(wallet);

  return (
    <DataTable
      columns={columns}
      data={userAssetsBalance.balances}
      name={title}
    />
  );
}
