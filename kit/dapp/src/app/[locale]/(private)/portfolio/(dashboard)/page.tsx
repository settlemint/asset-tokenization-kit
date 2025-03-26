import { AssetDistribution } from "@/components/blocks/charts/assets/asset-distribution";
import { PortfolioValue } from "@/components/blocks/charts/portfolio/portfolio-value";
import MyAssetsTable from "@/components/blocks/my-assets-table/my-assets-table-mini";
import { TransactionsHistory } from "@/components/blocks/transactions-table/transactions-history";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getAssetPriceInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { getTransactionsTimeline } from "@/lib/queries/transactions/transactions-timeline";
import { getCurrentUserDetail } from "@/lib/queries/user/current-user-detail";
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

  const [myAssetsBalance, data, userDetails] = await Promise.all([
    getUserAssetsBalance(user.wallet as Address),
    getTransactionsTimeline({
      timelineStartDate: oneMonthAgo,
      granularity: "DAY",
      from: user.wallet as Address,
    }),
    getCurrentUserDetail(),
  ]);

  const assetValues = await Promise.all(
    myAssetsBalance.balances.map(async (balance) => {
      const price = await getAssetPriceInUserCurrency(balance.asset.id);
      return price.amount * balance.value;
    })
  );

  const totalUserAssetsValue = assetValues.reduce(
    (acc, value) => acc + value,
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
        <PortfolioValue address={user.wallet as Address} />
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
          data={data}
          chartOptions={{
            intervalType: "month",
            intervalLength: 1,
            granularity: "day",
            chartContainerClassName: "h-[14rem] w-full",
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
