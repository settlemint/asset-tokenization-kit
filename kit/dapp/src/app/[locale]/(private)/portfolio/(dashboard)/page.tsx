import { TransactionsHistory } from "@/components/blocks/transactions-table/transactions-history";
import { getUser } from "@/lib/auth/utils";
import { geUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getTransactionsHistory } from "@/lib/queries/transactions/transactions-history";
import type { Address } from "viem";
import { Greeting } from "./_components/greeting/greeting";
import { MyAssetsHeader } from "./_components/header/my-assets-header";

export default async function PortfolioDashboard() {
  const user = await getUser();
  const myAssetsBalance = await geUserAssetsBalance(user.wallet as Address);

  const data = await getTransactionsHistory({
    processedAfter: new Date(),
    address: user.wallet as Address,
  });

  return (
    <>
      <div className="space-y-4">
        <Greeting />
        <MyAssetsHeader data={myAssetsBalance} />
        <TransactionsHistory
          data={data}
          chartOptions={{
            intervalType: "month",
            intervalLength: 1,
            granularity: "day",
            chartContainerClassName: "h-[14rem] w-full",
          }}
        />
      </div>
    </>
  );
}
