import { getUser } from "@/lib/auth/utils";
import { geUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import type { Address } from "viem";
import { Greeting } from "./_components/greeting/greeting";
import { MyAssetsHeader } from "./_components/header/my-assets-header";

export default async function PortfolioDashboard() {
  const user = await getUser();
  const myAssetsBalance = await geUserAssetsBalance(user.wallet as Address);
  return (
    <>
      <div className="space-y-4">
        <Greeting />
        <MyAssetsHeader data={myAssetsBalance} />
      </div>
    </>
  );
}
