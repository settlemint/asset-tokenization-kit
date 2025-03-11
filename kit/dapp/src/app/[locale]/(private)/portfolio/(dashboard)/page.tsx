import { AssetDistribution } from "@/components/blocks/charts/assets/asset-distribution";
import MyAssetsTable from "@/components/blocks/my-assets-table/my-assets-table-mini";
import { TransactionsHistory } from "@/components/blocks/transactions-table/transactions-history";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getTransactionsHistory } from "@/lib/queries/transactions/transactions-history";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { Greeting } from "./_components/greeting/greeting";
import { MyAssetsHeader } from "./_components/header/my-assets-header";
export default async function PortfolioDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio",
  });

  const user = await getUser();
  const myAssetsBalance = await getUserAssetsBalance(user.wallet as Address);

  const data = await getTransactionsHistory({
    processedAfter: new Date(),
    address: user.wallet as Address,
  });

  return (
    <>
      <PageHeader
        title={t("dashboard.page-title")}
        section={t("dashboard.portfolio-management")}
      />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:divide-x lg:divide-y-0">
        <Greeting />
        <MyAssetsHeader data={myAssetsBalance} />
        <TransactionsHistory
          data={data.map((tx) => ({
            timestamp: tx.createdAt.toISOString(),
            transaction: 1,
          }))}
          chartOptions={{
            intervalType: "month",
            intervalLength: 1,
            granularity: "day",
            chartContainerClassName: "h-[14rem] w-full",
          }}
        />
      </div>

      <PageHeader title={t("dashboard.my-assets")} className="mt-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 divide-x-0 divide-y lg:divide-x lg:divide-y-0">
        <AssetDistribution address={user.wallet as Address} />
        <MyAssetsTable
          wallet={user.wallet as Address}
          title={t("dashboard.my-assets")}
        />
      </div>
      <PageHeader title={t("dashboard.latest-events")} className="mt-8" />
    </>
  );
}
