import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AssetActivity } from "./_components/charts/asset-activity";
import { AssetsSupply } from "./_components/charts/assets-supply";
import { TransactionsHistory } from "./_components/charts/transactions-history";
import { UsersHistory } from "./_components/charts/users-history";
import { LatestEvents } from "./_components/table/latest-events";
import { AssetsWidget } from "./_components/widgets/assets";
import { TransactionsWidget } from "./_components/widgets/transactions";
import { UsersWidget } from "./_components/widgets/users";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.dashboard.page",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.dashboard.page",
  });

  return (
    <>
      <PageHeader title={t("title")} section={t("asset-management")} />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AssetsWidget />
        <TransactionsWidget />
        <UsersWidget />
      </div>
      <p className="mt-8 mb-4 font-semibold text-2xl">{t("stats-heading")}</p>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-2 2xl:grid-cols-4 lg:divide-x lg:divide-y-0">
        <AssetsSupply />
        <AssetActivity />
        <UsersHistory />
        <TransactionsHistory />
      </div>
      <p className="mt-8 mb-4 font-semibold text-2xl">
        {t("latest-events-heading")}
      </p>
      <LatestEvents />
    </>
  );
}
