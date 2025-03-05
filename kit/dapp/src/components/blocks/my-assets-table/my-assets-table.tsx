import { DataTable } from "@/components/blocks/data-table/data-table";
import { getMyAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-my";
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
  const myAssetsBalance = await getMyAssetsBalance(wallet);

  return (
    <DataTable columns={columns} data={myAssetsBalance.balances} name={title} />
  );
}
