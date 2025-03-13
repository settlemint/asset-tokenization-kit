import { AssetDistribution } from "@/components/blocks/charts/assets/asset-distribution";
import { TransactionsHistory } from "@/components/blocks/transactions-table/transactions-history";
import { getTransactionsHistory } from "@/lib/queries/transactions/transactions-history";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { startOfDay, subMonths, subYears } from "date-fns";
import { getTranslations } from "next-intl/server";
import { DetailsGrid } from "./_components/details-grid";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.users.detail.charts");
  const user = await getUserDetail({ id });

  const oneMonthAgo = startOfDay(subMonths(new Date(), 1));
  const oneYearAgo = startOfDay(subYears(new Date(), 1));
  const [dataOneMonth, dataOneYear] = await Promise.all([
    getTransactionsHistory({
      processedAfter: oneMonthAgo,
      address: user.wallet,
    }),
    getTransactionsHistory({
      processedAfter: oneYearAgo,
      address: user.wallet,
    }),
  ]);

  return (
    <>
      <DetailsGrid id={id} />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 divide-x-0 divide-y lg:divide-x lg:divide-y-0">
        <AssetDistribution address={user.wallet} />
        <TransactionsHistory
          title={t("transaction-history-last-month.title")}
          description={t("transaction-history-last-month.description")}
          data={dataOneMonth.map((tx) => ({
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
        <TransactionsHistory
          title={t("transaction-history-last-year.title")}
          description={t("transaction-history-last-year.description")}
          data={dataOneYear.map((tx) => ({
            timestamp: tx.createdAt.toISOString(),
            transaction: 1,
          }))}
          chartOptions={{
            intervalType: "year",
            intervalLength: 1,
            granularity: "month",
            chartContainerClassName: "h-[14rem] w-full",
          }}
        />
      </div>
    </>
  );
}
