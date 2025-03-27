import { AssetDistribution } from "@/components/blocks/charts/assets/asset-distribution";
import { PortfolioValue } from "@/components/blocks/charts/portfolio/portfolio-value";
import MyAssetsTable from "@/components/blocks/my-assets-table/my-assets-table-mini";
import { TransactionsHistory } from "@/components/blocks/transactions-table/transactions-history";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getAssetsPriceInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { getPortfolioStats } from "@/lib/queries/portfolio/portfolio-stats";
import { getTransactionsTimeline } from "@/lib/queries/transactions/transactions-timeline";
import { getCurrentUserDetail } from "@/lib/queries/user/user-detail";
import { startOfDay, subMonths } from "date-fns";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { LatestEvents } from "../../assets/(dashboard)/_components/table/latest-events";
import { Greeting } from "./_components/greeting/greeting";
import { MyAssetsHeader } from "./_components/header/my-assets-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio",
  });

  return {
    title: {
      ...metadata.title,
      default: t("dashboard.page-title"),
    },
    description: t("dashboard.portfolio-management"),
  };
}

export default async function PortfolioDashboard({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio",
  });

  const user = await getUser();
  const oneMonthAgo = startOfDay(subMonths(new Date(), 1));

  const [myAssetsBalance, transactionsData, userDetails, portfolioStats] =
    await Promise.all([
      getUserAssetsBalance(user.wallet as Address),
      getTransactionsTimeline({
        timelineStartDate: oneMonthAgo,
        granularity: "DAY",
        from: user.wallet as Address,
      }),
      getCurrentUserDetail(),
      getPortfolioStats({
        address: user.wallet as Address,
        days: 30,
      }),
    ]);

  const assetPrices = await getAssetsPriceInUserCurrency(
    portfolioStats.map(({ asset }) => asset.id)
  );

  const totalUserAssetsValue = myAssetsBalance.balances.reduce(
    (acc, balance) =>
      acc +
      (assetPrices.get(balance.asset.id)?.amount ?? 0) * Number(balance.value),
    0
  );

  return (
    <>
      <PageHeader
        title={t("dashboard.page-title")}
        section={t("dashboard.portfolio-management")}
      />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:divide-x lg:divide-y-0">
        <Greeting />
        <MyAssetsHeader
          data={myAssetsBalance}
          userDetails={userDetails}
          totalValue={{
            amount: totalUserAssetsValue,
            currency: userDetails.currency,
          }}
        />
        <PortfolioValue
          portfolioStats={portfolioStats}
          assetPriceMap={assetPrices}
          locale={locale}
        />
      </div>

      <PageHeader title={t("dashboard.my-assets")} className="mt-8" />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y md:grid-cols-2 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AssetDistribution address={user.wallet as Address} />
        <MyAssetsTable
          wallet={user.wallet as Address}
          title={t("dashboard.my-assets")}
          variant="small"
        />
        <TransactionsHistory
          data={transactionsData}
          chartOptions={{
            intervalType: "month",
            intervalLength: 1,
            granularity: "day",
          }}
        />
      </div>
      <PageHeader title={t("dashboard.latest-events")} className="mt-8" />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:divide-x lg:divide-y-0">
        <LatestEvents sender={user.wallet as Address} />
      </div>
    </>
  );
}
