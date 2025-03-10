import { DataTable } from "@/components/blocks/data-table/data-table";
import { geUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import type { Address } from "viem";
import { columns } from "./my-assets-table-columns";

interface MyAssetsTableProps {
  wallet: Address;
}

export default async function MyAssetsTable({ wallet }: MyAssetsTableProps) {
  const myAssetsBalance = await geUserAssetsBalance(wallet);

  return (
    <DataTable
      columns={columns}
      data={myAssetsBalance.balances}
      name="my-assets-table"
    />
  );
}
