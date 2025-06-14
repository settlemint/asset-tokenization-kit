import { DataTable } from "@/components/blocks/data-table/data-table";
import { columns } from "@/components/blocks/user-permissions-table/user-permissions-table-columns";
import { getUser } from "@/lib/auth/get-user";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import type { Address } from "viem";

interface AssetPermissionsTableProps {
  wallet: Address;
  title: string;
}

export default async function AssetPermissionsTable({
  wallet,
  title,
}: AssetPermissionsTableProps) {
  const userAssetsBalance = await getUserAssetsBalance(wallet);
  const user = await getUser();

  return (
    <DataTable
      columnParams={{ currentUserWalletAddress: user.wallet }}
      columns={columns}
      data={userAssetsBalance.balances}
      name={title}
    />
  );
}
